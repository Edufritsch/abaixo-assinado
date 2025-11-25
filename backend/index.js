// backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const algorithm = 'aes-256-cbc';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Função para criptografar o CPF
function encrypt(text) {
  if (!text || !ENCRYPTION_KEY) {
    throw new Error('Texto ou chave de criptografia ausente.');
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Configuração de middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Configuração do Multer para uploads de arquivos
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Rotas
app.post('/auth/google/verify', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token não fornecido.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    res.json({
      success: true,
      user: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar o token do Google:', error.message);
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
});

app.get('/auth/govbr', (req, res) => {
  const nomeGovbr = 'João da Silva';
  const cpf = '12345678900';
  const accessToken = 'simulated_access_token_123';
  res.redirect(`http://localhost:5173/?nome_govbr=${nomeGovbr}&cpf=${cpf}&access_token=${accessToken}`);
});

app.get('/auth/govbr/callback', async (req, res) => {
  const { code } = req.query;
  const CLIENT_ID = process.env.GOVBR_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOVBR_CLIENT_SECRET;
  const CALLBACK_URL = process.env.GOVBR_CALLBACK_URL || 'http://localhost:5000/auth/govbr/callback';
  const GOVBR_TOKEN_URL = 'https://sso.staging.acesso.gov.br/token';

  if (!code) {
    return res.status(400).send('Código de autorização não recebido.');
  }

  try {
    const tokenResponse = await axios.post(
      GOVBR_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK_URL,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { id_token, access_token } = tokenResponse.data;
    const userInfo = jwt.decode(id_token);

    const frontendUrl = `http://localhost:5173/?nome_govbr=${encodeURIComponent(userInfo.name)}&cpf=${encodeURIComponent(userInfo.sub)}&access_token=${encodeURIComponent(access_token)}`;
    res.redirect(frontendUrl);
  } catch (error) {
    console.error('Erro na autenticação Gov.br:', error.response?.data || error.message);
    res.status(500).send('Erro na autenticação.');
  }
});

app.post('/api/assinatura', upload.single('foto'), async (req, res) => {
  const { nome, email, telefone, socioNumero, cpf } = req.body;
  const caminhoFoto = req.file ? req.file.path : null;

  try {
    if (!nome || !email || !telefone || !socioNumero || !cpf || !caminhoFoto) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios, incluindo a foto.' });
    }

    const cpfCriptografado = encrypt(cpf);
    
    const sql = `
      INSERT INTO assinaturas (
        nome_completo,
        email,
        telefone,
        numero_associado,
        cpf_criptografado,
        foto
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;

    const values = [
      nome,
      email,
      telefone,
      socioNumero,
      cpfCriptografado,
      caminhoFoto,
    ];

    const result = await pool.query(sql, values);
    res.status(201).json({ message: 'Assinatura registrada com sucesso!', assinatura: result.rows[0] });

  } catch (error) {
    console.error('Erro ao salvar a assinatura:', error);
    res.status(500).json({ error: 'Erro ao salvar a assinatura.', details: error.message });
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
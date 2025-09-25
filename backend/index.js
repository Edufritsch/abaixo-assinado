// backend/index.js

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { Pool } = require('pg'); // Adicione esta linha

const app = express()
const PORT = process.env.PORT || 5000

// Configuração de CORS
app.use(cors())
app.use(express.json())

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Criação da pasta de upload se não existir
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage })


// Variaveis de ambiente para o Gov.br
const CLIENT_ID = process.env.GOVBR_CLIENT_ID
const CLIENT_SECRET = process.env.GOVBR_CLIENT_SECRET
const CALLBACK_URL = process.env.GOVBR_CALLBACK_URL || 'http://localhost:5000/auth/govbr/callback'
const GOVBR_AUTH_URL = 'https://sso.staging.acesso.gov.br/authorize'
const GOVBR_TOKEN_URL = 'https://sso.staging.acesso.gov.br/token'

app.get('/auth/govbr', (req, res) => {
  // Dados de teste para simular o retorno do Gov.br
  const nomeGovbr = 'João da Silva';
  const cpf = '12345678900';
  const accessToken = 'simulated_access_token_123'; // Token de teste

  // Redireciona de volta para o frontend com os dados de teste
  res.redirect(`http://localhost:5173/?nome_govbr=${nomeGovbr}&cpf=${cpf}&access_token=${accessToken}`);
});

// --- Rota 2: Rota de retorno (callback) após a autenticação (versão real) ---
app.get('/auth/govbr/callback', async (req, res) => {
  const { code } = req.query

  if (!code) {
    return res.status(400).send('Código de autorização não recebido.')
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
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const { id_token, access_token } = tokenResponse.data
    const userInfo = jwt.decode(id_token)

    const frontendUrl = `http://localhost:5173/?nome_govbr=${encodeURIComponent(userInfo.name)}&cpf=${encodeURIComponent(userInfo.sub)}&access_token=${encodeURIComponent(access_token)}`;
    res.redirect(frontendUrl);

  } catch (error) {
    console.error('Erro na autenticação Gov.br:', error.response?.data || error.message)
    res.status(500).send('Erro na autenticação.')
  }
})


// Rota de assinatura
app.post('/api/assinatura', upload.single('foto'), async (req, res) => {
  const { nome, email, telefone, socioNumero, cpf } = req.body;
  const foto = req.file?.filename || null;

  if (!nome || !email || !telefone || !socioNumero || !cpf || !foto) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const insertQuery = `
      INSERT INTO assinaturas (
        nome_completo,
        email,
        telefone,
        numero_associado,
        cpf,
        foto,
        data_assinatura
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const values = [nome, email, telefone, socioNumero, cpf, foto];

    const result = await pool.query(insertQuery, values);
    console.log('Dados salvos no banco de dados:', result.rows[0]);

    return res.status(200).json({ message: 'Assinatura registrada com sucesso!' });

  } catch (error) {
    console.error('Erro ao salvar os dados no banco de dados:', error.message);
    return res.status(500).json({ error: 'Erro ao salvar a assinatura.', details: error.message });
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
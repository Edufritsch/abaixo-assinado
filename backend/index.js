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

// --- FUNÇÃO DE CRIPTOGRAFIA ---
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

// --- FUNÇÃO DE DESCRIPTOGRAFIA ---
function decrypt(encryptedText) {
  if (!encryptedText || !ENCRYPTION_KEY) {
    return null;
  }

  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedData = parts.join(':');

    if (iv.length !== 16) {
      throw new Error("IV inválido ou corrompido.");
    }

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;

  } catch (error) {
    console.error('Erro de Descriptografia:', error.message);
    return null;
  }
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CONFIGURAÇÃO DO POSTGRES (CORRIGIDA PARA RENDER — SSL OBRIGATÓRIO) ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// Configuração do Multer
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


// ROTAS
app.post('/auth/google/verify', async (req, res) => {
  // ... (rota google, igual ao seu original)
});

app.get('/auth/govbr', (req, res) => {
  // ... (rota govbr, igual ao seu original)
});

app.get('/auth/govbr/callback', async (req, res) => {
  // ... (callback, igual ao seu original)
});


// --- ROTA PRINCIPAL: SALVAR ASSINATURA ---
app.post('/api/assinatura', upload.single('foto'), async (req, res) => {
  const { nome, email, telefone, socioNumero, cpf, receberEmail, receberTelefone, receberPush } = req.body;
  const caminhoFoto = req.file ? req.file.path : null;

  try {
    const cpfCriptografado = encrypt(cpf);

    const sql = `
        INSERT INTO assinaturas (
            "nome_completo", "email", "telefone", "numero_associado",
            "cpf_criptografado", "foto", "receber_email",
            "receber_telefone", "receber_push"
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
    `.trim();

    const values = [
      nome,
      email,
      telefone,
      socioNumero,
      cpfCriptografado,
      caminhoFoto,
      receberEmail === 'true',
      receberTelefone === 'true',
      receberPush === 'true',
    ];

    const result = await pool.query(sql, values);

    res.status(201).json({ 
      message: 'Assinatura registrada com sucesso!', 
      assinatura: result.rows[0] 
    });

  } catch (error) {
    console.error('Erro ao salvar a assinatura:', error);
    res.status(500).json({ error: 'Erro ao salvar a assinatura.', details: error.message });
  }
});


// --- ROTA PARA ATUALIZAR PREFERÊNCIAS DE NOTIFICAÇÃO ---
app.post('/api/assinatura/consent', async (req, res) => {
  const { id, receberEmail, receberTelefone, receberPush } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID da assinatura é obrigatório.' });
  }

  try {
    const sql = `
        UPDATE assinaturas
        SET 
          receber_email = $2,
          receber_telefone = $3,
          receber_push = $4
        WHERE id = $1
        RETURNING *;
    `.trim();

    const values = [
      id,
      receberEmail,
      receberTelefone,
      receberPush
    ];

    const result = await pool.query(sql, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada.' });
    }

    res.status(200).json({
      message: 'Preferências atualizadas com sucesso!',
      assinatura: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar o consentimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar o consentimento.', details: error.message });
  }
});


// --- ROTA DE TESTE DE DESCRIPTOGRAFIA ---
app.get('/api/assinaturas/test/decrypt', async (req, res) => {
  try {
    const result = await pool.query('SELECT nome_completo, cpf_criptografado FROM assinaturas LIMIT 1');

    if (result.rows.length === 0) {
      return res.json({ message: 'Nenhuma assinatura cadastrada.' });
    }

    const { nome_completo, cpf_criptografado } = result.rows[0];
    const cpfDescriptografado = decrypt(cpf_criptografado);

    res.json({
      nome: nome_completo,
      cpf_criptografado: cpf_criptografado.substring(0, 10) + '...',
      cpf_descriptografado: cpfDescriptografado,
      observacao: "ATENÇÃO: não usar esta rota em produção sem autenticação."
    });

  } catch (error) {
    console.error("Erro no teste de descriptografia:", error);
    res.status(500).json({ error: "Erro ao testar a descriptografia." });
  }
});


// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em ${PORT}`);
});

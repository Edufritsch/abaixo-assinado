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

// --- FUNÇÃO DE CRIPTOGRAFIA (Original, usando IV dinâmico) ---
function encrypt(text) {
  if (!text || !ENCRYPTION_KEY) {
    throw new Error('Texto ou chave de criptografia ausente.');
  }
  // O IV DINÂMICO É CRUCIAL. ELE É GERADO AQUI.
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // O resultado é o IV + ':' + o texto criptografado
  return iv.toString('hex') + ':' + encrypted;
}

// --- FUNÇÃO DE DESCRIPTOGRAFIA (A NOVIDADE) ---
function decrypt(encryptedText) {
  if (!encryptedText || !ENCRYPTION_KEY) {
    return null;
  }

  try {
    // 1. Extrair o IV (Initialization Vector) e o texto cifrado
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex'); // O primeiro pedaço é o IV
    const encryptedData = parts.join(':'); // O restante é o dado cifrado
    
    // Checagem básica de integridade
    if (iv.length !== 16) {
      throw new Error("IV inválido ou corrompido.");
    }

    // 2. Criar o decifrador
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
    
    // 3. Descriptografar
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro de Descriptografia:', error.message);
    return null; // Retorna null em caso de erro (chave errada, dado corrompido, etc.)
  }
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
// ... (Rota Google Verify)
});

app.get('/auth/govbr', (req, res) => {
// ... (Rota Gov.br Simulação)
});

app.get('/auth/govbr/callback', async (req, res) => {
// ... (Rota Gov.br Callback)
});

app.post('/api/assinatura', upload.single('foto'), async (req, res) => {
  const { nome, email, telefone, socioNumero, cpf, receberEmail, receberTelefone, receberPush } = req.body;
  const caminhoFoto = req.file ? req.file.path : null;

  try {
    // ... validações ...

// NO SEU index.js:

    const cpfCriptografado = encrypt(cpf);
    
    const sql = `
        INSERT INTO assinaturas (
            "nome_completo", "email", "telefone", "numero_associado", 
            "cpf_criptografado", "foto", "receber_email", 
            "receber_telefone", "receber_push"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *;
    `.trim(); 
    // Usamos aspas duplas para garantir que o PostgreSQL entenda
    // os nomes em snake_case exatamente como foram criados.
    const values = [
      nome,
      email,
      telefone,
      socioNumero,
      cpfCriptografado,
      caminhoFoto,
      // Valores booleanos (convertidos pelo pg-node implicitamente ou 'true'/'false')
      receberEmail === 'true', 
      receberTelefone === 'true', 
      receberPush === 'true',
    ];

    const result = await pool.query(sql, values);
    res.status(201).json({ message: 'Assinatura registrada com sucesso!', assinatura: result.rows[0] });

  } catch (error) {
    console.error('Erro ao salvar a assinatura:', error);
    res.status(500).json({ error: 'Erro ao salvar a assinatura.', details: error.message });
  }
});

// A linha de teste foi removida daqui!
// const cpfOriginal = decrypt(cpfCriptografadoDoBanco); 
// Esta rota é chamada APENAS na tela de agradecimento para atualizar os checkboxes
app.post('/api/assinatura/consent', async (req, res) => {
    // Espera o 'id' e os três campos booleanos do frontend
    const { id, receberEmail, receberTelefone, receberPush } = req.body; 

    // Validação baseada no ID
    if (!id) {
        return res.status(400).json({ error: 'ID da assinatura é obrigatório para atualização de consentimento.' });
    }

    try {
        const sql = `
            UPDATE assinaturas
            SET 
                receber_email = $2,
                receber_telefone = $3,
                receber_push = $4
            WHERE id = $1  -- Usa a chave primária para garantir que o registro correto seja atualizado
            RETURNING *;
        `.trim();

        // Valores: [id, receberEmail, receberTelefone, receberPush]
        const values = [
            id,
            receberEmail, // Chega como true/false (booleano)
            receberTelefone, // Chega como true/false (booleano)
            receberPush, // Chega como true/false (booleano)
        ];

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Assinatura não encontrada para este ID.' });
        }
        
        res.status(200).json({ message: 'Preferências de notificação atualizadas com sucesso!', assinatura: result.rows[0] });

    } catch (error) {
        console.error('Erro ao atualizar o consentimento:', error);
        res.status(500).json({ error: 'Erro no servidor ao atualizar o consentimento.', details: error.message });
    }
});
// --- ROTA DE ADMINISTRAÇÃO PARA TESTAR DESCRIPTOGRAFIA (OPCIONAL) ---
// Esta rota é APENAS para demonstração. Em produção, use um token JWT ou autenticação!
app.get('/api/assinaturas/test/decrypt', async (req, res) => {
    try {
        const result = await pool.query('SELECT nome_completo, cpf_criptografado FROM assinaturas LIMIT 1');
        
        if (result.rows.length === 0) {
            return res.json({ message: 'Nenhuma assinatura encontrada para testar.' });
        }
        
        const { nome_completo, cpf_criptografado } = result.rows[0];
        
        const cpfDescriptografado = decrypt(cpf_criptografado);
        
        res.json({
            nome: nome_completo,
            cpf_criptografado: cpf_criptografado.substring(0, 10) + '...', // Mostra só o início
            cpf_descriptografado: cpfDescriptografado, // CUIDADO! NUNCA FAÇA ISSO EM PRODUÇÃO SEM SEGURANÇA!
            observacao: "Esta rota deve ser protegida. A descriptografia funcionou.",
        });

    } catch (error) {
        console.error("Erro no teste de descriptografia:", error);
        res.status(500).json({ error: "Erro ao testar a descriptografia." });
    }
});


// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
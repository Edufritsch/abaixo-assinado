require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 5000

// Configuração de CORS
app.use(cors())
app.use(express.json())

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

// Rota de assinatura
app.post('/api/assinatura', upload.single('foto'), (req, res) => {
  const { nome, email, telefone } = req.body
  const foto = req.file?.filename || null

  if (!nome || !email || !telefone || !foto) {
    return res.status(400).json({ error: 'Dados incompletos' })
  }

  // Simula gravação no banco
  console.log({ nome, email, telefone, foto })

  return res.status(200).json({ message: 'Assinatura registrada com sucesso!' })
})

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})

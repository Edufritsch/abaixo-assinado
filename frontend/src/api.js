export async function enviarAssinatura(formData) {
  const data = new FormData()
  data.append('nome', formData.nome)
  data.append('email', formData.email)
  data.append('telefone', formData.telefone)
  data.append('foto', formData.foto)

  try {
    const response = await fetch('https://abaixo-assinado-mwg6.onrender.com/api/assinatura', {

      method: 'POST',
      body: data
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar assinatura')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao enviar assinatura:', error)
    throw error
  }
}

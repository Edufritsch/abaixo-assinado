import { useState } from 'react'
import img1 from './imgs/1.png'
import img2 from './imgs/2.png'
import img3 from './imgs/3.png'
import img4 from './imgs/4.png'
import img5 from './imgs/5.png'

const etapas = [img1, img2, img3, img4]
const textos = [
  'Alebinho sempre queria mais do que podia pagar. Convencia todo mundo de que o futuro ia ser grandioso...',
  'Assinava tudo o que colocavam na frente dele, sem pensar nas consequências...',
  'Até que veio a conta... e todos ficaram assustados com os resultados.',
  'Desesperado, viu o Clube desmoronar.'
]

function AppComponent() {
  const [etapa, setEtapa] = useState(0)
  // MUDANÇA: Adicionado 'socioNumero' ao estado inicial
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', socioNumero: '', foto: null })
  const [finalizado, setFinalizado] = useState(false)

  const proximaEtapa = () => {
    if (etapa < etapas.length) setEtapa(etapa + 1)
  }

  const handleChange = e => {
    const { name, value, files } = e.target
    setFormData(prev => ({
      ...prev,
      // Usa files[0] para inputs do tipo 'file', e value para outros
      [name]: files ? files[0] : value
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    // 'formData' agora inclui o 'socioNumero'
    console.log('Dados do formulário a serem enviados:', formData)
    setFinalizado(true)
  }

  if (finalizado) {
    return (
      <div className="container">
        <h2>Obrigado!</h2>
        <p>Você está mudando a história do Internacional.</p>
        <img src={img5} alt="Barcelos chutado" className="etapa" />
      </div>
    )
  }

  if (etapa < etapas.length) {
    return (
      <div className="container">
        <img src={etapas[etapa]} alt={`Cena ${etapa + 1}`} className="etapa" />
        <p>{textos[etapa]}</p>
        <button onClick={proximaEtapa}>Continuar</button>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>VOCÊ É O SÓCIO. VOCÊ TEM QUE FAZER A SUA PARTE.</h2>
      <p>Comece agora. Preencha seus dados abaixo e autentique com o Gov.br</p>

      <div className="requerimento">
        <h3>REQUERIMENTO DE CONVOCAÇÃO DE ASSEMBLEIA GERAL EXTRAORDINÁRIA</h3>
        <p><strong>AO PRESIDENTE DO CONSELHO DELIBERATIVO</strong><br />SPORT CLUB INTERNACIONAL</p>
        <p><strong>ASSUNTO:</strong> Convocação de Assembleia Geral Extraordinária para Deliberação sobre a Destituição do Conselho de Gestão</p>
        <p>Nos termos do Art. 8º, inciso V do Estatuto Social do Sport Club Internacional, que garante aos associados o direito de requerer a convocação extraordinária da Assembleia Geral, desde que subscrito por no mínimo 1/25 dos associados votantes da última Assembleia Geral Eleitoral, vimos, por meio deste, apresentar requerimento com o objetivo de deliberar sobre a destituição do atual Conselho de Gestão.</p>

        <h4>1. Fundamentação Estatutária</h4>
        <ul>
          <li>Art. 8º, inciso V: prevê a legitimidade do requerimento por iniciativa dos associados, com indicação do motivo e fundamento nos interesses do Clube;</li>
          <li>Art. 21: define a Assembleia Geral como órgão soberano composto por todos os associados em pleno gozo de seus direitos estatutários;</li>
          <li>Art. 2º, parágrafo único: impõe como princípios da gestão do Clube a legalidade, impessoalidade, moralidade, publicidade, economicidade e eficiência.</li>
        </ul>

        <h4>2. Objeto da Assembleia</h4>
        <p>A deliberação sobre a destituição do Conselho de Gestão, motivada por grave desconformidade entre os atos da atual administração e os interesses institucionais, morais e financeiros do Sport Club Internacional, visando interromper um ciclo de instabilidade e iniciar um novo processo de reorganização do Clube.</p>

        <h4>3. Justificativa Complementar</h4>
        <p>Embora a soberania da Assembleia Geral prescinda de justificativa além da vontade dos associados, esta iniciativa se ancora em preocupações objetivas e recorrentes, como:</p>
        <ul>
          <li>Agravamento do endividamento do Clube, contrariando promessas de reorganização financeira e de equilíbrio orçamentário;</li>
          <li>Ausência de um plano estratégico institucional de longo prazo, tanto no futebol quanto nas áreas administrativa, patrimonial e associativa;</li>
          <li>Não cumprimento de promessas eleitorais públicas, como a construção do CT de Guaíba e a meta de transformar o Inter no “clube mais digital do Brasil”;</li>
          <li>Desorganização interna e administrativa, refletida em atrasos salariais, insegurança contratual, estagnação de receita e um modelo de gestão centralizador e descolado dos interesses dos associados;</li>
          <li>Resultados esportivos decepcionantes, fruto direto da ausência de planejamento técnico e financeiro compatível com a grandeza do Sport Club Internacional.</li>
        </ul>

        <h4>4. Pedido</h4>
        <p>Requer-se, com base nos dispositivos acima, que Vossa Senhoria, como Presidente do Conselho Deliberativo, proceda com a convocação da Assembleia Geral Extraordinária, a ser realizada nos termos do Estatuto, com a seguinte pauta:</p>
        <blockquote>“Deliberação sobre a destituição do atual Conselho de Gestão do Sport Club Internacional, nos termos do Estatuto Social.”</blockquote>

        <h4>5. Quórum de Apoio</h4>
        <p>O presente requerimento será subscrito por número superior a 1/25 dos associados que participaram da última Assembleia Geral Eleitoral, conforme determina o Estatuto Social.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input name="nome" type="text" placeholder="Nome completo" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
        <input name="telefone" type="tel" placeholder="Telefone" required onChange={handleChange} />
        
        {/* MUDANÇA: Novo campo de input para o número do sócio */}
        <input
          name="socioNumero"
          type="text"
          placeholder="Número do Sócio"
          required
          onChange={handleChange}
          value={formData.socioNumero}
        />

        <label>
          Foto da Carteirinha (comprovação):
          <input name="foto" type="file" accept="image/*" required onChange={handleChange} />
        </label>
        
        <button type="submit">Autenticar com Gov.br e Assinar</button>
      </form>
    </div>
  )
}

export default AppComponent
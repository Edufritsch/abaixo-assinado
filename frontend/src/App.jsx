import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './imgs/logo.png';
import img1 from './imgs/1.png';
import img2 from './imgs/2.png';
import img3 from './imgs/3.png';
import img4 from './imgs/4.png';
import img5 from './imgs/5.png';

const etapas = [img1, img2, img3, img4];
const textos = [
  'Alebinho sempre queria mais do que podia pagar. Convencia todo mundo de que o futuro ia ser grandioso...',
  'Assinava tudo o que colocavam na frente dele, sem pensar nas consequências...',
  'Até que veio a conta... e todos ficaram assustados com os resultados.',
  'Desesperado, viu o Clube desmoronar.'
];

const textoRequerimento = (
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
);

const textoTermosDeUso = (
  <div className="termos-uso">
    <h3>TERMOS DE USO E POLÍTICA DE PRIVACIDADE</h3>
    <p><strong>1. Nosso Compromisso com a Transparência</strong></p>
    <p>Bem-vindo(a) à nossa plataforma. Este documento foi criado para que você compreenda de forma clara e objetiva como coletamos e utilizamos suas informações. Acreditamos que a transparência é o primeiro passo para construirmos uma relação de confiança com todos os nossos apoiadores.</p>
    <p><strong>2. A Finalidade da Coleta de Dados</strong></p>
    <p>Para que sua participação seja validada e seu apoio possa ser formalmente incluído no requerimento de convocação da Assembleia Geral do Sport Club Internacional, precisamos coletar algumas informações essenciais. Estes dados são estritamente necessários para a comprovação de seu apoio, conforme exigido pelo Estatuto Social do Clube.</p>
    <p>Os dados pessoais que solicitamos são: nome completo, CPF, e-mail, telefone, número de sócio e uma foto que comprova sua identidade.</p>
    <p><strong>3. Como Usamos e Compartilhamos Suas Informações</strong></p>
    <p>Suas informações são utilizadas exclusivamente para a finalidade descrita acima. Para garantir a integridade e a segurança do processo de coleta de assinaturas, seus dados poderão ser compartilhados com parceiros estratégicos que nos auxiliam na validação e na organização das informações.</p>
    <p>Além disso, em situações de necessidade ou exigência legal, como em um processo judicial ou administrativo, suas informações poderão ser compartilhadas com as autoridades competentes. Nosso compromisso é sempre proteger seus dados e compartilhá-los apenas quando estritamente necessário para os objetivos do requerimento.</p>
    <p><strong>4. Sua Segurança é a Nossa Prioridade</strong></p>
    <p>Estamos em total conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/18). Todas as informações que você nos fornece são tratadas com a mais alta confidencialidade. Utilizamos tecnologias avançadas e medidas de segurança, como a criptografia, para proteger seus dados contra acessos não autorizados ou qualquer tipo de violação.</p>
    <p>Reconhecemos os desafios de segurança no ambiente digital e trabalhamos constantemente para aprimorar nossas defesas.</p>
    <p><strong>5. Sua Participação e Responsabilidade Compartilhada</strong></p>
    <p>Ao participar desta iniciativa, você demonstra que compreende os desafios e riscos inerentes ao ambiente online, incluindo a possibilidade de ciberataques, e aceita participar em defesa dos interesses maiores do Clube. Você concorda em nos isentar de responsabilidade por eventuais incidentes de segurança, como vazamento ou uso indevido de dados, a menos que seja comprovada nossa intenção de dolo ou má-fé.</p>
    <p><strong>6. Seu Consentimento</strong></p>
    <p>Ao clicar em "Aceito os termos", você manifesta seu consentimento de forma livre, informada e inequívoca com todas as cláusulas e condições descritas neste documento. Isso significa que você leu, compreendeu e concordou com a forma como suas informações serão coletadas e tratadas para a finalidade do requerimento.</p>
  </div>
);

function AppComponent() {
  const [etapa, setEtapa] = useState(-1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    socioNumero: '',
    foto: null,
    cpf: '',
    nomeGovbr: '',
    accessToken: '',
    picture: ''
  });
  const [finalizado, setFinalizado] = useState(false);
  const [leuRequerimento, setLeuRequerimento] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [canAcceptTerms, setCanAcceptTerms] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nomeGovbr = params.get('nome_govbr');
    const cpf = params.get('cpf');
    const accessToken = params.get('access_token');

    if (nomeGovbr && cpf && accessToken) {
      setFormData(prev => ({
        ...prev,
        nome: nomeGovbr,
        cpf: cpf,
        nomeGovbr: nomeGovbr,
        accessToken: accessToken,
      }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleScrollTermos = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setCanAcceptTerms(true);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      const response = await axios.post('http://localhost:5000/auth/google/verify', { token });
      const { user } = response.data;
      setFormData(prev => ({
        ...prev,
        nome: user.name,
        email: user.email,
        picture: user.picture
      }));
      setEtapa(0); // Inicia as telas de introdução com a tela de termos de uso
    } catch (error) {
      console.error('Erro ao verificar token no backend:', error.response?.data || error.message);
      alert('Erro ao entrar com o Google. Tente novamente.');
    }
  };

  const handleGoogleError = () => {
    console.log('Login com Google falhou');
    alert('Erro ao entrar com o Google. Tente novamente.');
  };

  const proximaEtapa = () => {
    if (etapa < etapas.length + 1) {
      setEtapa(etapa + 1);
    } else {
      setLeuRequerimento(true);
    }
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleGovbrLogin = () => {
    window.location.href = 'http://localhost:5000/auth/govbr';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    }
    try {
      const response = await axios.post('http://localhost:5000/api/assinatura', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Resposta do backend:', response.data);
      alert('Assinatura registrada com sucesso!');
      setFinalizado(true);
    } catch (error) {
      console.error('Erro ao enviar a assinatura:', error.response?.data || error.message);
      alert('Erro ao registrar a assinatura.');
    }
  };

  const showProfilePicture = etapa > -1 && formData.picture;

  return (
    <div className="container">
      {showProfilePicture && (
        <div className="profile-picture-container">
          <img src={formData.picture} alt="Foto de Perfil" className="profile-picture" />
        </div>
      )}

      {etapa === -1 ? (
        <GoogleOAuthProvider clientId="609122258755-gkf3vpgfp1l0utmpjjgbpjkqb6lftoea.apps.googleusercontent.com">
          <div className="container login-container">
            <h2>Seja Bem-Vindo!</h2>
            <img src={logo} alt="Logo" className="logo" />
            <p>Para continuar, entre com sua conta Google.</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </GoogleOAuthProvider>
      ) : finalizado ? (
        <>
          <h2>Obrigado!</h2>
          <p>Você está mudando a história do Internacional.</p>
          <img src={img5} alt="Barcelos chutado" className="etapa" />
        </>
      ) : !aceitouTermos ? (
        <>
          <h2>Aceite os Termos de Uso</h2>
          <div className="termos-container" onScroll={handleScrollTermos}>
            {textoTermosDeUso}
          </div>
          <button
            onClick={() => setAceitouTermos(true)}
            disabled={!canAcceptTerms}
            className={canAcceptTerms ? 'accept-button active' : 'accept-button'}
          >
            Aceito os termos
          </button>
        </>
      ) : etapa < etapas.length ? (
        <>
          <img src={etapas[etapa]} alt={`Cena ${etapa + 1}`} className="etapa" />
          <p>{textos[etapa]}</p>
          <button onClick={proximaEtapa}>Continuar</button>
        </>
      ) : etapa === etapas.length && !leuRequerimento ? (
        <>
          <h2>Requerimento para Destituição do Presidente</h2>
          {textoRequerimento}
          <button onClick={() => setLeuRequerimento(true)}>Li e concordo com o inteiro teor</button>
        </>
      ) : (
        <>
          <h2>VOCÊ É O SÓCIO. VOCÊ TEM QUE FAZER A SUA PARTE.</h2>
          <p>Comece agora. Preencha seus dados abaixo e autentique com o Gov.br</p>
          <form onSubmit={handleSubmit}>
            <input name="nome" type="text" placeholder="Nome completo" required onChange={handleChange} value={formData.nome} />
            <input name="email" type="email" placeholder="Email" required onChange={handleChange} value={formData.email} />
            <input name="telefone" type="tel" placeholder="Telefone" required onChange={handleChange} value={formData.telefone} />
            <input name="socioNumero" type="text" placeholder="Número do Sócio" required onChange={handleChange} value={formData.socioNumero} />
            <label>
              Foto da Carteirinha (comprovação):
              <input name="foto" type="file" accept="image/*" required onChange={handleChange} />
            </label>
            {formData.cpf ? (
              <button type="submit">Assinar com Gov.br</button>
            ) : (
              <button type="button" onClick={handleGovbrLogin}>Autenticar com Gov.br</button>
            )}
          </form>
        </>
      )}
    </div>
  );
}

export default AppComponent;
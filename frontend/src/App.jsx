import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import axios from 'axios';
// IMPORTAÇÃO DA BIBLIOTECA DE MASCARAMENTO
import InputMask from 'react-input-mask';

// CORREÇÃO: Importando 1.png, 2.png, etc., e usando a pasta 'imgs'
import imgLogo from './imgs/logo.png'; 
import img1 from './imgs/1.png'; // 1.png
import img2 from './imgs/2.png'; // 2.png
import img3 from './imgs/3.png'; // 3.png
import img4 from './imgs/4.png'; // 4.png
import img5 from './imgs/5.png'; // 5.png

// --- DEFINIÇÕES DE VARIÁVEIS E TEXTOS (FORA DO COMPONENTE) ---

const etapas = [img1, img2, img3, img4];
const textos = [
    'O Conselho de Gestão sempre queria mais do que podia pagar. Convencia todo mundo de que o futuro ia ser grandioso...',
    'Assinava tudo o que colocavam na frente dele, sem pensar nas consequências...',
    'Até que veio a conta... e todos ficaram assustados com os resultados.',
    'Desesperado, viu o Clube desmoronar.'
];

const textoRequerimento = (
    <div className="requerimento">
        <h3>REQUERIMENTO DE CONVOCAÇÃO DE ASSEMBLEIA GERAL EXTRAORDINÁRIA</h3>
        <p><strong>AO PRESIDENTE DO CONSELHO DELIBERATIVO</strong><br />SPORT CLUB INTERNACIONAL</p>
        <p><strong>ASSUNTO:</strong> Convocação de Assembleia General Extraordinária para Deliberação sobre a Destituição do Conselho de Gestão</p>
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


// --- COMPONENTE PRINCIPAL ---

function AppComponent() {
    // 1. DECLARAÇÃO DOS ESTADOS 
    const [etapa, setEtapa] = useState(-1); // -1 = Login, 0 = Termos, 1-4 = Cenas, 5 = Formulário
    const [aceitouTermos, setAceitouTermos] = useState(false);
    const [canAcceptTerms, setCanAcceptTerms] = useState(false);
    const [finalizado, setFinalizado] = useState(false);
    


    // NOVOS ESTADOS PARA GESTÃO DO FLUXO SEPARADO
    const [assinaturaId, setAssinaturaId] = useState(null); // Armazena o ID retornado pelo backend
    const [consentLoading, setConsentLoading] = useState(false); // Estado para o botão de consentimento
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        socioNumero: '',
        foto: null,
        cpf: '', 
        picture: '',
        // CONSENTIMENTOS: Envia true por default na primeira submissão e será atualizado separadamente
        receberEmail: true,
        receberTelefone: true,
        receberPush: true,
    });

    useEffect(() => {
        // Limpeza de URL params remanescentes de testes anteriores
        const params = new URLSearchParams(window.location.search);
        if (params.get('nome_govbr') || params.get('cpf')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleScrollTermos = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
            setCanAcceptTerms(true);
        }
    };
    
    // Funções de Login Google
    const handleGoogleSuccess = (credentialResponse) => {
        const profile = jwtDecode(credentialResponse.credential);
        setFormData(prev => ({
            ...prev,
            nome: profile.name,
            email: profile.email,
            picture: profile.picture
        }));
        setEtapa(0); // Vai para a etapa 0 (Termos de Uso)
    };
    
    const handleGoogleError = () => {
        console.log('Login com Google falhou');
        alert('Erro ao entrar com o Google. Tente novamente.');
    };

    const proximaEtapa = () => {
        if (etapa < etapas.length) {
            setEtapa(etapa + 1);
        }
    };
    
    // Ajuste para lidar com checkbox (optIn) e files
    const handleChange = e => {
        const { name, value, files, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            // O tipo file só é usado no handleSubmit. Os checkboxes são atualizados aqui.
            [name]: type === 'checkbox' ? checked : (files ? files[0] : value)
        }));
    };

    // --- FUNÇÃO DE SUBMISSÃO DA ASSINATURA PRINCIPAL (Etapa 4) ---
    const handleSubmit = async (e) => { 
        e.preventDefault();
        
        // Validação manual para campos obrigatórios
        if (!formData.nome || !formData.email || !formData.telefone || !formData.socioNumero || !formData.foto) {
            alert('Por favor, preencha todos os campos obrigatórios e anexe a foto da carteirinha.');
            return;
        }
        
        const data = new FormData();
        for (const key in formData) {
            // Adiciona todos os campos, incluindo os de consentimento (TRUE por padrão) e o arquivo
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        }

        try {
            const response = await axios.post('http://localhost:5000/api/assinatura', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // CAPTURA O ID DA ASSINATURA E SALVA NO ESTADO
            const novoId = response.data.assinatura.id; 
            setAssinaturaId(novoId);
            
            setFinalizado(true); // Vai para a tela de Agradecimento
        } catch (error) {
            console.error('Erro ao enviar a assinatura:', error.response?.data || error.message);
            alert('Erro ao registrar a assinatura. Tente novamente.');
        }
    };
    
    // --- NOVA FUNÇÃO PARA ATUALIZAR APENAS AS PREFERÊNCIAS DE CONSENTIMENTO ---
    const handleConsentUpdate = async () => {
        if (!assinaturaId) {
            alert('Erro: ID da assinatura não encontrado. A assinatura inicial pode não ter sido concluída.');
            return;
        }

        setConsentLoading(true);

        try {
            // Envia o ID e as preferências atuais do formData
            await axios.post('http://localhost:5000/api/assinatura/consent', {
                id: assinaturaId, // Chave primária para a atualização
                receberEmail: formData.receberEmail,
                receberTelefone: formData.receberTelefone,
                receberPush: formData.receberPush,
            });

            alert('Preferências de notificação atualizadas com sucesso!');
            // Poderia setar um estado 'consentSaved' para desabilitar o botão aqui, se necessário.

        } catch (error) {
            console.error('Erro ao atualizar as preferências:', error.response?.data || error.message);
            alert('Erro ao salvar as preferências. Tente novamente.');
        } finally {
            setConsentLoading(false);
        }
    };

    // Lógica de Renderização
    const showProfilePicture = etapa > -1 && formData.picture;

// --- FUNÇÃO PARA REINICIAR TODO O FLUXO APÓS FINALIZAR ---
    const resetarFluxo = () => {
        setEtapa(-1);
        setAceitouTermos(false);
        setCanAcceptTerms(false);
        setFinalizado(false);
        setAssinaturaId(null);

        setFormData({
            nome: '',
            email: '',
            telefone: '',
            socioNumero: '',
            foto: null,
            cpf: '',
            picture: '',
            receberEmail: true,
            receberTelefone: true,
            receberPush: true,
    });
};


    // Renderiza a tela de login (Etapa -1)
    if (etapa === -1) {
        return (
            <GoogleOAuthProvider clientId="609122258755-gkf3vpgfp1l0utmpjjgbpjkqb6lftoea.apps.googleusercontent.com">
                <div className="container login-container">
                    <h2>Seja Bem-Vindo!</h2>
                    <div className="logo-container">
                        <img src={imgLogo} alt="Logo" className="logo" /> 
                    </div>
                    <p>Para continuar, entre com sua conta Google.</p>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </div>
            </GoogleOAuthProvider>
        );
    }
    
    // Renderiza a tela final: Agradecimento e Notificações (Após o envio do formulário)
    if (finalizado) {
        return (
            <div className="container final-agradecimento">
                <h2>Obrigado!</h2>
                <p>Você está **mudando a história do Internacional** com esta atitude.</p>
                <img src={img5} alt="Barcelos chutado" className="etapa" />
                
                <hr/>
                <button 
                    onClick={resetarFluxo}
                    className="accept-button active"
                    style={{ marginTop: '20px' }}
                >
                    Fazer Nova Assinatura
                </button>



                {/* A seção de notificações AGORA é uma SEGUNDA AÇÃO */}
                <hr/>
                <div className="notificacoes-section">
                    <h3>Receber Notificações e Apoiar Novas Demandas</h3>
                    <p>Mantenha-se informado sobre a próxima **ação da Renovação Colorada** e futuras iniciativas:</p>
                    
                    {/* Checkbox 1: E-mail */}
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <input 
                            type="checkbox" 
                            name="receberEmail" 
                            checked={formData.receberEmail} 
                            onChange={handleChange}
                        />
                        <span style={{ marginLeft: '10px' }}>Por E-mail (Notícias e convocações futuras)</span>
                    </label>
                    
                    {/* Checkbox 2: Telefone/WhatsApp */}
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <input 
                            type="checkbox" 
                            name="receberTelefone" 
                            checked={formData.receberTelefone} 
                            onChange={handleChange}
                        />
                        <span style={{ marginLeft: '10px' }}>Por Telefone/WhatsApp (Avisos urgentes)</span>
                    </label>

                    {/* Checkbox 3: Notificação Push (Para futuros Apps) */}
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <input 
                            type="checkbox" 
                            name="receberPush" 
                            checked={formData.receberPush} 
                            onChange={handleChange}
                        />
                        <span style={{ marginLeft: '10px' }}>Notificação Push (Caso haja um app futuro para novas demandas)</span>
                    </label>
                    
                    {/* BOTÃO PARA ENVIAR AS PREFERÊNCIAS */}
                    <button 
                        onClick={handleConsentUpdate}
                        disabled={consentLoading}
                        className="accept-button active"
                    >
                        {consentLoading ? 'Salvando Preferências...' : 'Confirmar e Salvar Preferências'}
                    </button>
                    

                    <p className="small-text" style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>
                        Você pode ajustar essas opções a qualquer momento nos próximos comunicados.
                    </p>
                </div>
            </div>
        );
    }
    
    // Renderiza os Termos de Uso (Etapa 0)
    if (!aceitouTermos) {
        return (
            <div className="container">
                {showProfilePicture && (
                    <div className="profile-picture-container">
                        <img src={formData.picture} alt="Foto de Perfil" className="profile-picture" />
                    </div>
                )}
                <h2>Aceite os Termos de Uso</h2>
                <div className="termos-container" onScroll={handleScrollTermos}>
                    {textoTermosDeUso}
                </div>
                <button
                    onClick={() => setAceitouTermos(true)}
                    disabled={!canAcceptTerms}
                    className={canAcceptTerms ? 'accept-button active' : 'accept-button'}
                >
                    Li e Aceito os Termos
                </button>
            </div>
        );
    }

    // Renderiza as Cenas de Introdução (Etapas 1, 2, 3)
    if (etapa < etapas.length) {
        return (
            <div className="container">
                {showProfilePicture && (
                    <div className="profile-picture-container">
                        <img src={formData.picture} alt="Foto de Perfil" className="profile-picture" />
                    </div>
                )}
                <img src={etapas[etapa]} alt={`Cena ${etapa + 1}`} className="etapa" />
                <p>{textos[etapa]}</p>
                <button onClick={proximaEtapa}>Continuar</button>
            </div>
        );
    }

    // Renderiza a tela do Requerimento E o Formulário (Etapa 4/Call to Action)
    if (etapa === etapas.length) {
        return (
            <div className="container requerimento-assinatura-container">
                {showProfilePicture && (
                    <div className="profile-picture-container">
                        <img src={formData.picture} alt="Foto de Perfil" className="profile-picture" />
                    </div>
                )}
                
                <h2>Requerimento para Destituição do Conselho de Gestão</h2>
                <hr />
                
                {/* 1. CALL TO ACTION */}
                <div className="call-to-action-header">
                    <h2>VOCÊ É O SÓCIO. FAÇA A SUA PARTE.</h2>
                    <p>Sua assinatura é crucial. Leia o documento na íntegra.</p>
                </div>
                
                {/* 2. REQUERIMENTO (Corpo do Documento) */}
                <div className="requerimento-content">
                    {textoRequerimento}
                </div>
                
                <hr />

                {/* 3. FORMULÁRIO DE PREENCHIMENTO E SUBMISSÃO */}
                <div className="assinatura-section">
                    <h2>Preencha Aqui e Salve o Inter.</h2>
                    <p>Preencha os campos obrigatórios e envie a **foto da carteirinha** para validação da sua assinatura.</p>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Dados pré-preenchidos */}
                        <input name="nome" type="text" placeholder="Nome completo" required onChange={handleChange} value={formData.nome} readOnly={!!formData.nome} />
                        <input name="email" type="email" placeholder="Email" required onChange={handleChange} value={formData.email} readOnly={!!formData.email} />
                        
                        {/* CAMPOS COM MASCARAMENTO */}
                        <InputMask 
                            name="cpf" 
                            mask="999.999.999-99" 
                            placeholder="CPF (Opcional)" 
                            onChange={handleChange} 
                            value={formData.cpf}
                        />

                        <InputMask 
                            name="telefone" 
                            mask="(99) 99999-9999" 
                            placeholder="Telefone" 
                            required 
                            onChange={handleChange} 
                            value={formData.telefone}
                        />
                        
                        {/* Campo de Sócio */}
                        <input name="socioNumero" type="text" placeholder="Número do Sócio" required onChange={handleChange} value={formData.socioNumero} />
                        
                        {/* Comprovação - OBRIGATÓRIA */}
                        <label className="file-label">
                            Foto da Carteirinha (Comprovação Obrigatória):
                            <input name="foto" type="file" accept="image/*" required onChange={handleChange} />
                        </label>

                        {/* Botão de Ação */}
                        <button type="submit" className="final-button">
                            Assinar e Enviar
                        </button>
                    </form>
                </div>
            </div>
        );
    }
} // FIM DO COMPONENTE PRINCIPAL

export default AppComponent;
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, collection, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { iniciarNovaRodada } from './iniciar-rodada.js';

const perguntas = [
    // Segurança na Internet (Difícil)
    {
        pergunta: "O que é ransomware e como se proteger?",
        respostas: ["Vírus que rouba senhas; use antivírus.", "Malware que criptografa dados e exige resgate; faça backup e cuidado com links.", "Software que acelera a internet; otimize rede.", "Ataque que sobrecarrega servidores; use firewall."],
        respostaCorreta: "Malware que criptografa dados e exige resgate; faça backup e cuidado com links."
    },
    {
        pergunta: "O que é ataque de 'força bruta' e como 2FA ajuda?",
        respostas: ["Tentativas repetidas de adivinhar senhas; 2FA exige segunda verificação.", "Ataque físico ao computador; 2FA protege hardware.", "Ataque que desativa antivírus; 2FA fortalece software.", "Ataque que inunda a rede; 2FA filtra tráfego."],
        respostaCorreta: "Tentativas repetidas de adivinhar senhas; 2FA exige segunda verificação."
    },
    {
        pergunta: "Diferença entre criptografia simétrica e assimétrica?",
        respostas: ["Simétrica: uma chave para cripto/decripto; Assimétrica: mesma chave.", "Simétrica: mesma chave; Assimétrica: par de chaves (pública/privada).", "Simétrica: dados pequenos; Assimétrica: dados grandes.", "Simétrica: mais lenta; Assimétrica: mais rápida."],
        respostaCorreta: "Simétrica: mesma chave; Assimétrica: par de chaves (pública/privada)."
    },
    {
        pergunta: "O que é certificado digital e sua importância online?",
        respostas: ["Documento físico de identidade.", "Arquivo eletrônico que verifica identidade e garante autenticidade/integridade da comunicação.", "Software que criptografa arquivos.", "Código de segurança para Wi-Fi."],
        respostaCorreta: "Arquivo eletrônico que verifica identidade e garante autenticidade/integridade da comunicação."
    },
    {
        pergunta: "Função da VPN na segurança da internet?",
        respostas: ["Aumentar velocidade da internet.", "Criar conexão segura e criptografada sobre rede pública, protegendo privacidade e anonimato.", "Bloquear anúncios em sites.", "Otimizar jogos online."],
        respostaCorreta: "Criar conexão segura e criptografada sobre rede pública, protegendo privacidade e anonimato."
    },
    {
        pergunta: "O que é ataque DDoS e como afeta serviços online?",
        respostas: ["Ataque que rouba dados; afeta privacidade.", "Ataque que inunda servidor com tráfego, tornando serviço indisponível.", "Ataque que instala vírus; afeta desempenho.", "Ataque que modifica sites; afeta integridade."],
        respostaCorreta: "Ataque que inunda servidor com tráfego, tornando serviço indisponível."
    },
    {
        pergunta: "Importância da 'higiene digital' e práticas essenciais?",
        respostas: ["Manter computador limpo fisicamente.", "Limpar histórico de navegação.", "Práticas para manter segurança e privacidade online; senhas fortes, atualizações, cuidado com links.", "Organizar arquivos digitais."],
        respostaCorreta: "Práticas para manter segurança e privacidade online; senhas fortes, atualizações, cuidado com links."
    },
    {
        pergunta: "O que é engenharia reversa em segurança e como hackers a usam?",
        respostas: ["Desfazer backup de dados.", "Analisar software para entender funcionamento; hackers a usam para encontrar vulnerabilidades.", "Criar software a partir de código existente.", "Otimizar algoritmos."],
        respostaCorreta: "Analisar software para entender funcionamento; hackers a usam para encontrar vulnerabilidades."
    },
    {
        pergunta: "Papel do SIEM em ambientes corporativos?",
        respostas: ["Gerenciar senhas de funcionários.", "Monitorar e analisar eventos de segurança em tempo real para identificar ameaças.", "Criptografar dados da empresa.", "Desenvolver novos softwares de segurança."],
        respostaCorreta: "Monitorar e analisar eventos de segurança em tempo real para identificar ameaças."
    },
    {
        pergunta: "O que é 'Zero-Day Exploit'?",
        respostas: ["Vulnerabilidade descoberta e corrigida no mesmo dia.", "Falha de segurança desconhecida, explorada antes de correção.", "Ataque que ocorre no primeiro dia de uso de software.", "Técnica de hacking que não deixa rastros."],
        respostaCorreta: "Falha de segurança desconhecida, explorada antes de correção."
    },

    // Informática Básica (Pacote Office/Hardware) (Difícil)
    {
        pergunta: "Arquitetura de Von Neumann e sua importância?",
        respostas: ["Arquitetura de rede para servidores.", "Modelo de computador que armazena programas e dados na mesma memória; fundamental para computadores de uso geral.", "Processador de múltiplos núcleos.", "Sistema operacional para mainframes."],
        respostaCorreta: "Modelo de computador que armazena programas e dados na mesma memória; fundamental para computadores de uso geral."
    },
    {
        pergunta: "Diferença entre VLOOKUP e HLOOKUP no Excel?",
        respostas: ["VLOOKUP: busca vertical; HLOOKUP: busca horizontal.", "VLOOKUP: tabelas pequenas; HLOOKUP: tabelas grandes.", "VLOOKUP: busca texto; HLOOKUP: busca números.", "VLOOKUP: planilhas simples; HLOOKUP: planilhas complexas."],
        respostaCorreta: "VLOOKUP: busca vertical; HLOOKUP: busca horizontal."
    },
    {
        pergunta: "O que é virtualização e aplicação em servidores?",
        respostas: ["Criação de máquinas virtuais para jogos.", "Capacidade de criar múltiplas instâncias de SO em um hardware físico; otimiza recursos e isola ambientes.", "Simulação de hardware.", "Conexão de vários servidores em uma rede."],
        respostaCorreta: "Capacidade de criar múltiplas instâncias de SO em um hardware físico; otimiza recursos e isola ambientes."
    },
    {
        pergunta: "Função do BIOS/UEFI e diferença?",
        respostas: ["Gerenciar conexão com internet.", "Inicializar hardware e carregar SO; UEFI é versão mais moderna do BIOS.", "Controlar teclado e mouse.", "Armazenar arquivos do usuário."],
        respostaCorreta: "Inicializar hardware e carregar SO; UEFI é versão mais moderna do BIOS."
    },
    {
        pergunta: "Utilidade dos 'Estilos' no Word para documentos longos?",
        respostas: ["Apenas mudar cor da fonte.", "Aplicar formatações pré-definidas consistentemente, facilitando atualização e sumários.", "Criar tabelas e gráficos.", "Inserir imagens e vídeos."],
        respostaCorreta: "Aplicar formatações pré-definidas consistentemente, facilitando atualização e sumários."
    },
    {
        pergunta: "O que é overclocking e seus riscos?",
        respostas: ["Aumentar armazenamento; risco de perda de dados.", "Aumentar velocidade de componentes além das especificações; risco de superaquecimento e instabilidade.", "Diminuir consumo de energia.", "Conectar vários monitores."],
        respostaCorreta: "Aumentar velocidade de componentes além das especificações; risco de superaquecimento e instabilidade."
    },
    {
        pergunta: "Função do 'Slide Master' no PowerPoint?",
        respostas: ["Criar slides individuais rapidamente.", "Definir design, fontes, cores e layouts para todos os slides, garantindo consistência.", "Adicionar animações e transições.", "Gerenciar ordem dos slides."],
        respostaCorreta: "Definir design, fontes, cores e layouts para todos os slides, garantindo consistência."
    },
    {
        pergunta: "Conceito de 'cache' em computadores e importância?",
        respostas: ["Armazenamento permanente para backups.", "Memória pequena e rápida que armazena dados frequentemente acessados pelo processador, acelerando desempenho.", "Tipo de disco rígido externo.", "Software que limpa arquivos temporários."],
        respostaCorreta: "Memória pequena e rápida que armazena dados frequentemente acessados pelo processador, acelerando desempenho."
    },
    {
        pergunta: "Diferença entre software proprietário e código aberto?",
        respostas: ["Proprietário: pago; código aberto: gratuito.", "Proprietário: código fechado e licença restritiva; Código aberto: código disponível e licença permissiva.", "Proprietário: para empresas; código aberto: para uso pessoal.", "Proprietário: mais seguro; Código aberto: menos seguro."],
        respostaCorreta: "Proprietário: código fechado e licença restritiva; Código aberto: código disponível e licença permissiva."
    },
    {
        pergunta: "O que é RAID e sua principal utilidade?",
        respostas: ["Tipo de conexão de rede.", "Tecnologia que combina múltiplos discos para melhorar desempenho, redundância ou ambos.", "Sistema de backup automático.", "Software para gerenciar armazenamento em nuvem."],
        respostaCorreta: "Tecnologia que combina múltiplos discos para melhorar desempenho, redundância ou ambos."
    },

    // Inteligência Artificial (IA) (Difícil)
    {
        pergunta: "O que é 'Aprendizado por Reforço' (Reinforcement Learning) e exemplo?",
        respostas: ["Aprendizado supervisionado; reconhecimento de imagens.", "Agente aprende por tentativa e erro em ambiente, recebendo recompensas/punições; ex: jogos (AlphaGo), robótica.", "Método para classificar dados.", "Algoritmo que agrupa dados."],
        respostaCorreta: "Agente aprende por tentativa e erro em ambiente, recebendo recompensas/punições; ex: jogos (AlphaGo), robótica."
    },
    {
        pergunta: "O que é 'Transfer Learning' em Deep Learning?",
        respostas: ["Transferir dados de um modelo para outro.", "Reutilizar modelo pré-treinado em tarefa semelhante com dados limitados, para acelerar treinamento e melhorar desempenho.", "Transferir conhecimento humano para máquina.", "Aprender a transferir arquivos eficientemente."],
        respostaCorreta: "Reutilizar modelo pré-treinado em tarefa semelhante com dados limitados, para acelerar treinamento e melhorar desempenho."
    },
    {
        pergunta: "Diferença entre IA Geral (AGI) e Estreita (ANI)?",
        respostas: ["AGI: para robôs; ANI: para softwares.", "AGI: capacidade cognitiva humana para qualquer tarefa; ANI: especializada em tarefa única.", "AGI: mais antiga; ANI: mais recente.", "AGI: teórica; ANI: prática."],
        respostaCorreta: "AGI: capacidade cognitiva humana para qualquer tarefa; ANI: especializada em tarefa única."
    },
    {
        pergunta: "Conceito de 'Viés em IA' e como mitigar?",
        respostas: ["Erro de programação; corrigido com testes.", "Tendência de algoritmo a produzir resultados tendenciosos por dados desequilibrados; mitigado com dados diversos e auditoria.", "Preferência da IA por tipo de dados.", "Capacidade da IA de aprender rapidamente."],
        respostaCorreta: "Tendência de algoritmo a produzir resultados tendenciosos por dados desequilibrados; mitigado com dados diversos e auditoria."
    },
    {
        pergunta: "O que são GANs e sua aplicação principal?",
        respostas: ["Redes neurais para análise financeira.", "Duas redes neurais que competem para criar dados sintéticos realistas (imagens, audio).", "Redes neurais para reconhecimento de voz.", "Redes neurais para otimização de algoritmos."],
        respostaCorreta: "Duas redes neurais que competem para criar dados sintéticos realistas (imagens, audio)."
    },
    {
        pergunta: "Papel do 'Big Data' no desenvolvimento da IA?",
        respostas: ["Apenas armazenar informações antigas.", "Fornecer grandes volumes de dados para treinar modelos de IA, permitindo aprendizado complexo e previsões.", "Acelerar velocidade da internet.", "Gerenciar segurança de sistemas de IA."],
        respostaCorreta: "Fornecer grandes volumes de dados para treinar modelos de IA, permitindo aprendizado complexo e previsões."
    },
    {
        pergunta: "O que é 'Explainable AI' (XAI)?",
        respostas: ["IA que se explica sozinha.", "Campo da IA focado em tornar modelos mais transparentes e compreensíveis para humanos, explicando decisões.", "IA que cria explicações para softwares.", "IA que gera código automaticamente."],
        respostaCorreta: "Campo da IA focado em tornar modelos mais transparentes e compreensíveis para humanos, explicando decisões."
    },
    {
        pergunta: "Diferença entre RPA e IA?",
        respostas: ["São a mesma coisa.", "RPA: automatiza tarefas repetitivas baseadas em regras; IA: simula inteligência para tarefas cognitivas e adaptativas.", "RPA: para robôs físicos; IA: para softwares.", "RPA: mais complexa que IA."],
        respostaCorreta: "RPA: automatiza tarefas repetitivas baseadas em regras; IA: simula inteligência para tarefas cognitivas e adaptativas."
    },
    {
        pergunta: "O que é computação quântica e impacto na IA?",
        respostas: ["Novo tipo de processador para celulares.", "Tecnologia que usa mecânica quântica para resolver problemas complexos, com potencial para revolucionar a IA.", "Sistema de armazenamento de dados na nuvem.", "Forma de tornar IA mais eficiente em energia."],
        respostaCorreta: "Tecnologia que usa mecânica quântica para resolver problemas complexos, com potencial para revolucionar a IA."
    },
    {
        pergunta: "Conceito de 'Singularidade Tecnológica' em relação à IA?",
        respostas: ["Ponto em que a IA se torna obsoleta.", "Ponto hipotético onde crescimento tecnológico se torna incontrolável/irreversível, com mudanças imprevisíveis na civilização.", "Momento em que a IA alcança inteligência humana.", "Criação de única IA que controla tecnologias."],
        respostaCorreta: "Ponto hipotético onde crescimento tecnológico se torna incontrolável/irreversível, com mudanças imprevisíveis na civilização."
    },

    // História da Tecnologia + Dispositivos Móveis (Difícil)
    { pergunta: "Quem é Ada Lovelace e sua contribuição?", respostas: ["Inventora do telefone.", "Matemática e escritora, primeira programadora por seu trabalho na Máquina Analítica.", "Criadora da World Wide Web.", "Desenvolvedora do primeiro SO."], respostaCorreta: "Matemática e escritora, primeira programadora por seu trabalho na Máquina Analítica." },
    { pergunta: "Importância da ARPANET na história da internet?", respostas: ["Primeira rede social.", "Precursora da internet, desenvolvida para comunicação militar e acadêmica.", "Criou o primeiro navegador web.", "Desenvolveu o primeiro e-mail."], respostaCorreta: "Precursora da internet, desenvolvida para comunicação militar e acadêmica." },
    { pergunta: "Diferença entre 'software de sistema' e 'aplicação'?", respostas: ["Sistema: para hardware; Aplicação: para usuários.", "Sistema: gerencia hardware/serviços; Aplicação: para tarefas específicas do usuário.", "Sistema: gratuito; Aplicação: pago.", "Sistema: mais antigo; Aplicação: mais recente."], respostaCorreta: "Sistema: gerencia hardware/serviços; Aplicação: para tarefas específicas do usuário." },
    { pergunta: "Conceito de 'Lei de Metcalfe' e relevância?", respostas: ["Lei que prevê velocidade da internet.", "Valor de rede proporcional ao quadrado do número de usuários; explica crescimento exponencial de redes.", "Lei sobre consumo de energia.", "Previsão de obsolescência de tecnologias."], respostaCorreta: "Valor de rede proporcional ao quadrado do número de usuários; explica crescimento exponencial de redes." },
    { pergunta: "Contribuição de Grace Hopper para a computação?", respostas: ["Inventora do mouse.", "Pioneira da programação, desenvolveu primeiro compilador e popularizou 'bug'.", "Criadora do primeiro SO gráfico.", "Desenvolvedora da primeira linguagem orientada a objetos."], respostaCorreta: "Pioneira da programação, desenvolveu primeiro compilador e popularizou 'bug'." },
    { pergunta: "O que é IoT e exemplos?", respostas: ["Novo tipo de internet para carros.", "Rede de objetos físicos com sensores/software para conectar e trocar dados; ex: casas inteligentes, wearables.", "Protocolo de segurança para dispositivos móveis.", "Sistema de IA para eletrodomésticos."], respostaCorreta: "Rede de objetos físicos com sensores/software para conectar e trocar dados; ex: casas inteligentes, wearables." },
    { pergunta: "Diferença entre Web 1.0, 2.0 e 3.0?", respostas: ["Apenas versões diferentes.", "Web 1.0 (estática), Web 2.0 (interativa, social), Web 3.0 (semântica, descentralizada, IA).", "Web 1.0: desktop; 2.0: mobile; 3.0: VR.", "Web 1.0: texto; 2.0: imagens; 3.0: vídeo."], respostaCorreta: "Web 1.0 (estática), Web 2.0 (interativa, social), Web 3.0 (semântica, descentralizada, IA)." },
    { pergunta: "Quem são os co-fundadores da Apple Inc.?", respostas: ["Bill Gates e Paul Allen.", "Larry Page e Sergey Brin.", "Steve Jobs, Steve Wozniak e Ronald Wayne.", "Mark Zuckerberg e Dustin Moskovitz."], respostaCorreta: "Steve Jobs, Steve Wozniak e Ronald Wayne." },
    { pergunta: "Importância do GPS para dispositivos móveis e sociedade?", respostas: ["Permite fazer chamadas.", "Fornece localização precisa globalmente, essencial para navegação e apps.", "Aumenta duração da bateria.", "Melhora qualidade das fotos."], respostaCorreta: "Fornece localização precisa globalmente, essencial para navegação e apps." },
    { pergunta: "O que é 5G e seu principal benefício?", respostas: ["Nova frequência de rádio para Wi-Fi.", "Quinta geração de tecnologia celular, oferecendo velocidades muito mais altas, menor latência e maior capacidade.", "Novo padrão para redes domésticas.", "Tecnologia para melhorar segurança de dados móveis."], respostaCorreta: "Quinta geração de tecnologia celular, oferecendo velocidades muito mais altas, menor latência e maior capacidade." },

    // Mídias Sociais (Difícil)
    {
        pergunta: "Explique 'bolha de filtro' e 'câmara de eco' nas redes sociais.",
        respostas: ["Termos para velocidade de notícias falsas.", "Bolha de filtro: algoritmos isolam usuário de info contraditórias. Câmara de eco: usuários se cercam de opiniões semelhantes.", "Estratégias de marketing digital.", "Ferramentas de privacidade."],
        respostaCorreta: "Bolha de filtro: algoritmos isolam usuário de info contraditórias. Câmara de eco: usuários se cercam de opiniões semelhantes."
    },
    {
        pergunta: "O que é 'marketing de influência' e seu impacto?",
        respostas: ["Marketing que usa IA.", "Estratégia que usa influenciadores para promover produtos/serviços, impactando decisões de compra.", "Marketing focado em anúncios pagos.", "Marketing que ignora redes sociais."],
        respostaCorreta: "Estratégia que usa influenciadores para promover produtos/serviços, impactando decisões de compra."
    },
    {
        pergunta: "Diferença entre 'mídia social' e 'rede social'?",
        respostas: ["São sinônimos.", "Mídia social: plataforma (ex: Facebook); Rede social: conexão entre pessoas na plataforma.", "Mídia social: para empresas; Rede social: para indivíduos.", "Mídia social: para conteúdo; Rede social: para comunicação."],
        respostaCorreta: "Mídia social: plataforma (ex: Facebook); Rede social: conexão entre pessoas na plataforma."
    },
    {
        pergunta: "O que é 'curadoria de conteúdo' em mídias sociais e por que é importante?",
        respostas: ["Criar próprio conteúdo original.", "Selecionar, organizar e apresentar conteúdo relevante de outras fontes para audiência; importante para agregar valor e autoridade.", "Remover conteúdo indesejado.", "Compartilhar tudo que encontra."],
        respostaCorreta: "Selecionar, organizar e apresentar conteúdo relevante de outras fontes para audiência; importante para agregar valor e autoridade."
    },
    {
        pergunta: "Explique 'algoritmo de feed' e como personaliza a experiência.",
        respostas: ["Algoritmo que organiza posts cronologicamente.", "Conjunto de regras que analisa comportamento do usuário para determinar conteúdo relevante no feed.", "Algoritmo que bloqueia conteúdo indesejado.", "Algoritmo que cria conteúdo automaticamente."],
        respostaCorreta: "Conjunto de regras que analisa comportamento do usuário para determinar conteúdo relevante no feed."
    },
    {
        pergunta: "Importância da 'verificação de fatos' no combate às fake news?",
        respostas: ["Não é importante.", "Fundamental para identificar e desmentir informações falsas, combatendo desinformação.", "Apenas para notícias políticas.", "É uma forma de censura."],
        respostaCorreta: "Fundamental para identificar e desmentir informações falsas, combatendo desinformação."
    },
    {
        pergunta: "O que é 'dark social' no compartilhamento de conteúdo?",
        respostas: ["Compartilhamento em redes sociais com tema sombrio.", "Compartilhamento por canais privados (e-mail, mensagens) não rastreáveis por ferramentas de marketing.", "Compartilhamento em grupos secretos.", "Compartilhamento apenas à noite."],
        respostaCorreta: "Compartilhamento por canais privados (e-mail, mensagens) não rastreáveis por ferramentas de marketing."
    },
    {
        pergunta: "Diferença entre 'conteúdo orgânico' e 'pago' em mídias sociais?",
        respostas: ["Orgânico: para fotos; Pago: para vídeos.", "Orgânico: alcança audiência naturalmente; Pago: promovido por anúncios.", "Orgânico: para perfis pessoais; Pago: para empresas.", "Orgânico: mais fácil; Pago: mais difícil."],
        respostaCorreta: "Orgânico: alcança audiência naturalmente; Pago: promovido por anúncios."
    },
    {
        pergunta: "O que é 'sentiment analysis' e sua aplicação?",
        respostas: ["Analisar humor dos usuários.", "Processo de determinar tom emocional de texto em mídias sociais; usado para entender percepção de marca.", "Analisar quantidade de sentimentos.", "Analisar sentimento de música compartilhada."],
        respostaCorreta: "Processo de determinar tom emocional de texto em mídias sociais; usado para entender percepção de marca."
    },
    {
        pergunta: "Impacto das 'micro-influencers' no marketing?",
        respostas: ["Não têm impacto significativo.", "Audiências menores, mas altamente engajadas e nichadas, resultando em maior autenticidade e conversão.", "Influenciadores em redes sociais pequenas.", "Influenciadores que usam micro-vídeos."],
        respostaCorreta: "Audiências menores, mas altamente engajadas e nichadas, resultando em maior autenticidade e conversão."
    }
];

let pontuacaodificil = 0;
let tempoRestante = 20;
let temporizador;
let perguntasEmbaralhadas = [];
let indicePerguntaAtual = 0;
let currentUser = null;
let currentRoundId = null;
let perguntaElemento;
let opcoesElemento;
let tempoElemento;
let gameOverMessageDiv;
let customAlertModal;
let customAlertMessage;
let customAlertCloseButton;

function showCustomAlert(message, callback = null) {
    if (customAlertModal && customAlertMessage) {
        customAlertMessage.textContent = message;
        customAlertModal.classList.remove('hidden'); 
        if (callback) {
            customAlertCloseButton.onclick = () => {
                hideCustomAlert();
                callback();
            };
        } else {
            customAlertCloseButton.onclick = hideCustomAlert;
        }
    } else {
        console.error("Elementos do customAlertModal não encontrados. Exibindo alert padrão.");
        alert(message);
        if (callback) callback();
    }
}

function hideCustomAlert() {
    if (customAlertModal) {
        customAlertModal.classList.add('hidden'); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded disparado em scriptdificil.js");
    perguntaElemento = document.getElementById("pergunta");
    opcoesElemento = document.getElementById("opcoes");
    tempoElemento = document.getElementById("tempo");
    gameOverMessageDiv = document.getElementById("gameOverMessage");
    customAlertModal = document.getElementById('customAlertModal');
    customAlertMessage = document.getElementById('customAlertMessage');
    customAlertCloseButton = document.getElementById('customAlertCloseButton');
    if (customAlertCloseButton) {
        customAlertCloseButton.addEventListener('click', hideCustomAlert);
    }
    if (!perguntaElemento) { console.error("Erro: Elemento 'pergunta' não encontrado!"); return; }
    if (!opcoesElemento) { console.error("Erro: Elemento 'opcoes' não encontrado!"); return; }
    if (!tempoElemento) { console.error("Erro: Elemento 'tempo' não encontrado!"); return; }
    if (!gameOverMessageDiv) { console.error("Erro: Elemento 'gameOverMessage' não encontrado!"); return; }
    if (!customAlertModal) { console.error("Erro: Elemento 'customAlertModal' não encontrado!"); return; }
    if (!customAlertMessage) { console.error("Erro: Elemento 'customAlertMessage' não encontrado!"); return; }
    if (!customAlertCloseButton) { console.error("Erro: Elemento 'customAlertCloseButton' não encontrado!"); return; }

    onAuthStateChanged(auth, async (user) => { 
        if (user) {
            currentUser = user;
            console.log("Usuário logado no quiz difícil:", currentUser.email, "UID:", currentUser.uid);

            currentRoundId = localStorage.getItem('currentQuizRoundId');
            if (!currentRoundId) {
                console.log("Nenhum ID de rodada encontrado. Iniciando uma nova rodada automaticamente.");
                currentRoundId = await iniciarNovaRodada(); 
                console.log("Nova rodada iniciada com ID:", currentRoundId);
            } else {
                console.log("ID da rodada atual encontrado:", currentRoundId);
            }
            embaralharPerguntas();
            exibirPergunta();
        } else {
            currentUser = null;
            console.warn("Nenhum usuário logado. Redirecionando para login.");
            localStorage.setItem('redirectAfterLogin', window.location.href);
            showCustomAlert('Você precisa estar logado para jogar o quiz!', () => {
                window.location.href = 'login.html';
            });
        }
    });
});
function embaralharPerguntas() {
    let array = [...perguntas];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    perguntasEmbaralhadas = array.slice(0, 10);
    console.log("Perguntas embaralhadas (10 selecionadas):", perguntasEmbaralhadas.length);

    perguntasEmbaralhadas.forEach(pergunta => {
        let respostasArray = [...pergunta.respostas]; 
        for (let i = respostasArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [respostasArray[i], respostasArray[j]] = [respostasArray[j], respostasArray[i]];
        }
        pergunta.respostas = respostasArray;
    });
}


function atualizarTemporizador() {
    if (tempoElemento) { 
        tempoElemento.textContent = tempoRestante;
    } else {
        console.warn("Elemento 'tempo' não encontrado para atualizar temporizador.");
    }

    if (tempoRestante === 0) {
        clearInterval(temporizador);
       
        if (perguntaElemento) perguntaElemento.classList.add('hidden');
        if (opcoesElemento) opcoesElemento.classList.add('hidden');
        if (tempoElemento) tempoElemento.classList.add('hidden');
        if (gameOverMessageDiv) {
            gameOverMessageDiv.innerHTML = `
                <p class="text-2xl font-bold text-red-600 mb-4">Tempo esgotado! Você não foi rápido o suficiente.</p>
                <button id="backToIndexButton" class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">Voltar ao Início</button>
            `;
            gameOverMessageDiv.classList.remove('hidden');
            const backToIndexButton = document.getElementById('backToIndexButton');
            if (backToIndexButton) {
                backToIndexButton.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
        } else {
            showCustomAlert("Tempo esgotado! Você não foi rápido o suficiente. Redirecionando para o início.", () => {
                window.location.href = 'index.html';
            });
        }
    } else {
        tempoRestante--;
    }
}

function iniciarTemporizador() {
    tempoRestante = 20;
    atualizarTemporizador();
    if (temporizador) {
        clearInterval(temporizador);
    }
    temporizador = setInterval(atualizarTemporizador, 1000);
}

function exibirPergunta() {
    console.log("Chamando exibirPergunta()..."); 
    try {
        if (!currentUser || !currentRoundId) {
            console.log("Aguardando login do usuário ou ID da rodada para exibir a pergunta...");
            return;
        }
        if (!perguntaElemento || !opcoesElemento || !tempoElemento || !gameOverMessageDiv) {
            console.error("Erro: Um ou mais elementos HTML do quiz não foram encontrados.");
            showCustomAlert("Erro ao carregar o quiz. Verifique a estrutura da página (IDs de elementos).");
            return;
        }
        if (indicePerguntaAtual >= 10) {
            console.log("Todas as 10 perguntas foram exibidas. Exibindo resultado.");
            exibirResultado();
            return;
        }
        if (perguntasEmbaralhadas.length === 0) {
            console.error("Erro: Array de perguntas embaralhadas está vazio. Reiniciando embaralhamento.");
            embaralharPerguntas();
            if (perguntasEmbaralhadas.length === 0) {
                showCustomAlert("Erro fatal: Nenhuma pergunta disponível para o quiz.");
                return;
            }
        }
        const pergunta = perguntasEmbaralhadas[indicePerguntaAtual];
        console.log("Tentando exibir pergunta:", indicePerguntaAtual, pergunta);

        if (!pergunta || !pergunta.pergunta || !pergunta.respostas) {
            console.error("Erro: Objeto de pergunta inválido no índice atual. Verifique o array de perguntas.");
            showCustomAlert("Erro ao carregar perguntas. Recarregue a página.");
            return;
        }

        gameOverMessageDiv.classList.add('hidden'); 
        perguntaElemento.classList.remove('hidden'); 
        opcoesElemento.classList.remove('hidden');     
        tempoElemento.classList.remove('hidden');       


        perguntaElemento.textContent = pergunta.pergunta;

        opcoesElemento.innerHTML = "";
        pergunta.respostas.forEach((resposta) => {
            const botaoResposta = document.createElement("button");
            botaoResposta.textContent = resposta;
            botaoResposta.classList.add("botao"); 
            botaoResposta.addEventListener("click", () => selecionarResposta(pergunta, resposta));
            opcoesElemento.appendChild(botaoResposta);
        });

        iniciarTemporizador();
        console.log(`Exibindo pergunta ${indicePerguntaAtual + 1}: ${pergunta.pergunta}`);
    } catch (error) {
        console.error("Erro inesperado em exibirPergunta():", error);
        showCustomAlert("Ocorreu um erro ao exibir a pergunta. Por favor, recarregue a página.");
    }
}


function selecionarResposta(perguntaAtualObj, resposta) {
    pararTemporizador();

    if (resposta === perguntaAtualObj.respostaCorreta) {
        pontuacaodificil++;
    }

    desabilitarRespostas(perguntaAtualObj.respostaCorreta, resposta);
    setTimeout(() => {
        indicePerguntaAtual++; 
        exibirPergunta(); 
    }, 500);
}

function pararTemporizador() {
    clearInterval(temporizador);
}

function desabilitarRespostas(respostaCorreta, respostaSelecionada) {
    const botoesResposta = opcoesElemento.querySelectorAll(".botao");
    botoesResposta.forEach(botao => {
        botao.disabled = true;
        if (botao.textContent === respostaCorreta) {
            botao.style.backgroundColor = 'lightgreen';
        } else if (botao.textContent === respostaSelecionada &&
                    botao.textContent !== respostaCorreta) {
            botao.style.backgroundColor = 'lightcoral';
        }
    });
}

async function salvarPontuacaoFirebase(pontuacao) {
    if (!currentUser || !currentRoundId) { 
        showCustomAlert("Você precisa estar logado e ter uma rodada iniciada para salvar sua pontuação!");
        return;
    }
    try {
        const scoresCollection = collection(db, "scores");
        await addDoc(scoresCollection, {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            difficulty: 'dificil',
            score: pontuacao,
            timestamp: new Date(),
            roundId: currentRoundId 
        });
        console.log("Pontuação difícil salva com sucesso no Firestore para a rodada:", currentRoundId);
        await salvarMelhorPontuacaoUsuario(pontuacao, 'dificil');
    } catch (error) {
        console.error("Erro ao salvar pontuação difícil no Firestore:", error);
        showCustomAlert("Erro ao salvar sua pontuação. Por favor, tente novamente.");
    }
}

async function salvarMelhorPontuacaoUsuario(novaPontuacao, difficulty) {
    if (currentUser) {
        try {
            const userRef = doc(db, "user_profiles", currentUser.uid);
            const userDoc = await getDoc(userRef);

            let userScores = {};
            if (userDoc.exists()) {
                userScores = userDoc.data().scores || {};
            }

            const currentBestScoreForDifficulty = userScores[difficulty.toLowerCase()] || 0;

            if (novaPontuacao > currentBestScoreForDifficulty) {
                userScores[difficulty.toLowerCase()] = novaPontuacao;
                await setDoc(userRef, {
                    email: currentUser.email,
                    scores: userScores,
                    lastGameTimestamp: new Date()
                }, { merge: true });
                console.log(`Melhor pontuação do usuário para ${difficulty} atualizada!`);
            }
        } catch (error) {
            console.error("Erro ao salvar melhor pontuação do usuário:", error);
        }
    }
}

async function exibirResultado() {
    pararTemporizador();
    await salvarPontuacaoFirebase(pontuacaodificil);
    localStorage.setItem('lastPlayedRoundId', currentRoundId); 
    window.location.href = "resultadof.html"; 
}

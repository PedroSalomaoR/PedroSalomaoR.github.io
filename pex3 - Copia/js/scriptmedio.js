import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, collection, query, orderBy, limit, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { iniciarNovaRodada } from './iniciar-rodada.js';

const perguntas = [
    // Segurança na Internet (Médio)
    {
        pergunta: "O que é 'phishing' e como se proteger?",
        respostas: ["Tipo de pesca digital; verificar remetente e links.", "Software de edição de fotos; usar filtros.", "Método de criptografia; instalar firewall.", "Jogo online; jogar em servidores seguros."],
        respostaCorreta: "Tipo de pesca digital; verificar remetente e links."
    },
    {
        pergunta: "Função principal de um firewall em rede doméstica?",
        respostas: ["Acelerar internet.", "Bloquear acesso não autorizado à rede.", "Otimizar PC.", "Gerenciar senhas."],
        respostaCorreta: "Bloquear acesso não autorizado à rede."
    },
    {
        pergunta: "O que significa 'HTTPS'?",
        respostas: ["HyperText Transfer Protocol Standard.", "HyperText Transfer Protocol Secure.", "High-Tech Transfer Protocol System.", "Home Page Transfer Protocol Service."],
        respostaCorreta: "HyperText Transfer Protocol Secure."
    },
    {
        pergunta: "Por que usar senhas fortes e únicas?",
        respostas: ["Para facilitar memorização.", "Evitar que vazamento em um serviço comprometa outros.", "Para rastrear atividades.", "Melhorar velocidade de login."],
        respostaCorreta: "Evitar que vazamento em um serviço comprometa outros."
    },
    {
        pergunta: "O que é autenticação de dois fatores (2FA)?",
        respostas: ["Login com duas senhas.", "Camada extra de segurança com duas verificações.", "Duas pessoas na mesma conta.", "Protocolo seguro de dados."],
        respostaCorreta: "Camada extra de segurança com duas verificações."
    },
    {
        pergunta: "Qual o risco de Wi-Fi público desprotegido?",
        respostas: ["Internet lenta.", "Dispositivo superaquecer.", "Dados interceptados por terceiros.", "Desconexão frequente."],
        respostaCorreta: "Dados interceptados por terceiros."
    },
    {
        pergunta: "O que é 'malware'?",
        respostas: ["Tipo de hardware.", "Software malicioso para danificar/acessar sistemas.", "Programa para otimizar sistema.", "Erro de programação."],
        respostaCorreta: "Software malicioso para danificar/acessar sistemas."
    },
    {
        pergunta: "Como identificar e-mail de phishing?",
        respostas: ["Sempre de banco conhecido.", "Erros de ortografia, pedidos urgentes, links suspeitos.", "Sempre com anexos grandes.", "Saudação personalizada."],
        respostaCorreta: "Erros de ortografia, pedidos urgentes, links suspeitos."
    },
    {
        pergunta: "Importância de manter SO e softwares atualizados?",
        respostas: ["Só para novas funcionalidades.", "Corrigir vulnerabilidades e melhorar desempenho.", "Ocupar mais espaço.", "Mudar interface."],
        respostaCorreta: "Corrigir vulnerabilidades e melhorar desempenho."
    },
    {
        pergunta: "O que é 'engenharia social' em segurança?",
        respostas: ["Softwares de engenharia para sistemas seguros.", "Manipulação psicológica para obter informações confidenciais.", "Estudo de redes sociais.", "Criação de redes sociais seguras."],
        respostaCorreta: "Manipulação psicológica para obter informações confidenciais."
    },

    // Informática Básica (Pacote Office/Hardware) (Médio)
    {
        pergunta: "Qual componente executa instruções de programas?",
        respostas: ["Memória RAM.", "Placa de vídeo.", "Processador (CPU).", "Disco Rígido (HD/SSD)."],
        respostaCorreta: "Processador (CPU)."
    },
    {
        pergunta: "No Word, função de 'Quebra de Página'?",
        respostas: ["Dividir documento em colunas.", "Inserir nova página em ponto específico.", "Remover quebras de linha.", "Alterar orientação da página."],
        respostaCorreta: "Inserir nova página em ponto específico."
    },
    {
        pergunta: "No Excel, fórmula para somar A1 a A5?",
        respostas: ["=SOMA(A1-A5)", "=SOMA[A1:A5]", "=SOMA(A1:A5)", "=SOMAR(A1,A5)"],
        respostaCorreta: "=SOMA(A1:A5)"
    },
    {
        pergunta: "Diferença entre RAM e ROM?",
        respostas: ["RAM: armazenamento longo; ROM: curto.", "RAM: volátil; ROM: não-volátil.", "RAM: mais lenta; ROM: mais rápida.", "ROM: para programas; RAM: para SO."],
        respostaCorreta: "RAM: volátil; ROM: não-volátil."
    },
    {
        pergunta: "No PowerPoint, 'Modo de Exibição do Apresentador'?",
        respostas: ["Público vê anotações.", "Exibir slides em tela cheia para público e controle para apresentador.", "Editar slides durante apresentação.", "Ocultar barra de tarefas."],
        respostaCorreta: "Exibir slides em tela cheia para público e controle para apresentador."
    },
    {
        pergunta: "O que é um 'sistema operacional'?",
        respostas: ["Programa para navegar na internet.", "Conjunto de softwares que gerencia hardware e software do PC.", "Tipo de hardware de rede.", "Aplicativo para criar documentos."],
        respostaCorreta: "Conjunto de softwares que gerencia hardware e software do PC."
    },
    {
        pergunta: "Função de SSD vs HD?",
        respostas: ["Armazenar menos dados, mais barato.", "Mais lento, consome mais energia.", "Maior velocidade de leitura/escrita e durabilidade.", "Só para backup."],
        respostaCorreta: "Maior velocidade de leitura/escrita e durabilidade."
    },
    {
        pergunta: "No Excel, o que é 'referência absoluta'?",
        respostas: ["Referência que muda ao copiar.", "Referência para célula em outra planilha.", "Referência que permanece fixa ao copiar (ex: $A$1).", "Referência a intervalo de células."],
        respostaCorreta: "Referência que permanece fixa ao copiar (ex: $A$1)."
    },
    {
        pergunta: "Diferença entre navegador e motor de busca?",
        respostas: ["São a mesma coisa.", "Navegador: acessar sites; Motor de busca: encontrar info na web.", "Navegador: SO; Motor de busca: aplicativo.", "Navegador: e-mails; Motor de busca: documentos."],
        respostaCorreta: "Navegador: acessar sites; Motor de busca: encontrar info na web."
    },
    {
        pergunta: "O que é 'cloud computing'?",
        respostas: ["PCs que flutuam.", "Armazenamento e acesso a dados/programas pela internet, não no seu PC.", "Processador de alta velocidade.", "Nova forma de programar."],
        respostaCorreta: "Armazenamento e acesso a dados/programas pela internet, não no seu PC."
    },

    // Inteligência Artificial (IA) (Médio)
    {
        pergunta: "Principal objetivo do 'Machine Learning'?",
        respostas: ["Máquinas pensarem como humanos.", "Desenvolver robôs humanos.", "Capacitar sistemas a aprenderem de dados sem programação explícita.", "Criar algoritmos para jogos."],
        respostaCorreta: "Capacitar sistemas a aprenderem de dados sem programação explícita."
    },
    {
        pergunta: "O que é 'Processamento de Linguagem Natural' (PLN)?",
        respostas: ["Criação de novas linguagens de programação.", "Capacidade de computador entender, interpretar e gerar linguagem humana.", "Tradução automática de idiomas.", "Análise de dados numéricos em textos."],
        respostaCorreta: "Capacidade de computador entender, interpretar e gerar linguagem humana."
    },
    {
        pergunta: "Diferença entre IA 'forte' e 'fraca'?",
        respostas: ["IA forte: mais rápida; fraca: mais lenta.", "IA forte: consciência e inteligência humana; fraca: para tarefas específicas.", "IA forte: para robôs; fraca: para softwares.", "IA forte: mais cara; fraca: mais barata."],
        respostaCorreta: "IA forte: consciência e inteligência humana; fraca: para tarefas específicas."
    },
    {
        pergunta: "O que são 'Redes Neurais Artificiais'?",
        respostas: ["Tipo de rede de computadores para jogos.", "Sistemas de IA inspirados no cérebro humano para reconhecer padrões.", "Nova tecnologia de internet.", "Programas para criar gráficos 3D."],
        respostaCorreta: "Sistemas de IA inspirados no cérebro humano para reconhecer padrões."
    },
    {
        pergunta: "Em que área 'Visão Computacional' é usada?",
        respostas: ["Criação de música.", "Análise e interpretação de imagens e vídeos por computadores.", "Edição de textos.", "Desenvolvimento de jogos de tabuleiro."],
        respostaCorreta: "Análise e interpretação de imagens e vídeos por computadores."
    },
    {
        pergunta: "Conceito de 'Deep Learning'?",
        respostas: ["Aprendizado superficial.", "Subcampo do Machine Learning com redes neurais profundas.", "Aprender em ambientes subaquáticos.", "IA para mergulho."],
        respostaCorreta: "Subcampo do Machine Learning com redes neurais profundas."
    },
    {
        pergunta: "O que é 'algoritmo de recomendação'?",
        respostas: ["Algoritmo que recomenda software.", "Algoritmo que sugere itens/conteúdos com base em preferências.", "Algoritmo para problemas matemáticos.", "Algoritmo que organiza arquivos."],
        respostaCorreta: "Algoritmo que sugere itens/conteúdos com base em preferências."
    },
    {
        pergunta: "Papel da IA em veículos autônomos?",
        respostas: ["Controlar rádio do carro.", "Processar dados de sensores para navegação, detecção de obstáculos e decisões.", "Controlar ar condicionado.", "Gerenciar manutenção do veículo."],
        respostaCorreta: "Processar dados de sensores para navegação, detecção de obstáculos e decisões."
    },
    {
        pergunta: "O que é 'Ética na IA'?",
        respostas: ["Estudo de como IA cria arte.", "Preocupação com desenvolvimento e uso responsável da IA, impactos sociais/morais.", "Estudo de como IA pode ser mais eficiente.", "Criação de leis para IA."],
        respostaCorreta: "Preocupação com desenvolvimento e uso responsável da IA, impactos sociais/morais."
    },
    {
        pergunta: "Diferença entre 'Automação' e 'Inteligência Artificial'?",
        respostas: ["São a mesma coisa.", "Automação: tarefas repetitivas; IA: simula inteligência para problemas complexos.", "IA: para robôs; Automação: para softwares.", "Automação: mais avançada que IA."],
        respostaCorreta: "Automação: tarefas repetitivas; IA: simula inteligência para problemas complexos."
    },

    // História da Tecnologia + Dispositivos Móveis (Médio)
    { pergunta: "Primeiro computador eletrônico digital de propósito geral?", respostas: ["UNIVAC I", "ENIAC", "IBM PC", "Apple II"], respostaCorreta: "ENIAC" },
    { pergunta: "Quem é o 'pai da computação'?", respostas: ["Alan Turing", "Charles Babbage", "John von Neumann", "Grace Hopper"], respostaCorreta: "Charles Babbage" },
    { pergunta: "Primeiro microprocessador comercial?", respostas: ["Intel 8086", "Motorola 68000", "Intel 4004", "Zilog Z80"], respostaCorreta: "Intel 4004" },
    { pergunta: "Ano de lançamento público da World Wide Web?", respostas: ["1985", "1991", "1995", "2000"], respostaCorreta: "1991" },
    { pergunta: "Empresa que lançou primeiro smartphone com tela sensível ao toque?", respostas: ["Nokia", "Motorola", "IBM (Simon Personal Communicator)", "Apple (iPhone)"], respostaCorreta: "IBM (Simon Personal Communicator)" },
    { pergunta: "Impacto do transistor na eletrônica?", respostas: ["Dispositivos maiores e mais caros.", "Miniaturização e desenvolvimento de eletrônicos modernos.", "Aumento do consumo de energia.", "Não teve impacto."], respostaCorreta: "Miniaturização e desenvolvimento de eletrônicos modernos." },
    { pergunta: "O que é 'Lei de Moore'?", respostas: ["Previsão de velocidade da internet.", "Número de transistores em microchip dobra a cada dois anos.", "Consumo de energia de computadores.", "Obsolescência de softwares."], respostaCorreta: "Número de transistores em microchip dobra a cada dois anos." },
    { pergunta: "Primeiro console de videogame doméstico a usar cartuchos ROM?", respostas: ["Atari 2600", "Magnavox Odyssey", "Nintendo Entertainment System (NES)", "Sega Master System"], respostaCorreta: "Magnavox Odyssey" },
    { pergunta: "Quem são os co-fundadores da Microsoft?", respostas: ["Steve Jobs e Steve Wozniak", "Bill Gates e Paul Allen", "Larry Page e Sergey Brin", "Mark Zuckerberg e Eduardo Saverin"], respostaCorreta: "Bill Gates e Paul Allen" },
    { pergunta: "Primeiro celular a popularizar jogos móveis ('Snake')?", respostas: ["Motorola StarTAC", "Nokia 3310", "BlackBerry 850", "Siemens C45"], respostaCorreta: "Nokia 3310" },

    // Mídias Sociais (Médio)
    {
        pergunta: "Principal objetivo do LinkedIn?",
        respostas: ["Compartilhar fotos/vídeos pessoais.", "Conectar profissionais e promover networking/carreira.", "Postar mensagens curtas/notícias.", "Compartilhar vídeos de entretenimento."],
        respostaCorreta: "Conectar profissionais e promover networking/carreira."
    },
    {
        pergunta: "O que é 'engajamento' em mídias sociais?",
        respostas: ["Número de seguidores.", "Interação dos usuários com o conteúdo (curtidas, comentários, compartilhamentos).", "Frequência de postagens.", "Tempo na plataforma."],
        respostaCorreta: "Interação dos usuários com o conteúdo (curtidas, comentários, compartilhamentos)."
    },
    {
        pergunta: "Conceito de 'algoritmo' em redes sociais?",
        respostas: ["Tipo de vírus.", "Conjunto de regras que determina o que o usuário vê no feed.", "Programa para posts automáticos.", "Ferramenta para bloquear usuários."],
        respostaCorreta: "Conjunto de regras que determina o que o usuário vê no feed."
    },
    {
        pergunta: "O que é 'influenciador digital'?",
        respostas: ["Pessoa que cria muitos memes.", "Alguém com grande audiência e capacidade de impactar opiniões/comportamentos online.", "Programador de redes sociais.", "Usuário que só consome conteúdo."],
        respostaCorreta: "Alguém com grande audiência e capacidade de impactar opiniões/comportamentos online."
    },
    {
        pergunta: "Diferença entre 'perfil' e 'página' (Facebook)?",
        respostas: ["Não há diferença.", "Perfil: pessoas; Página: empresas/marcas/figuras públicas.", "Perfil: público; Página: privada.", "Perfil: amigos; Página: família."],
        respostaCorreta: "Perfil: pessoas; Página: empresas/marcas/figuras públicas."
    },
    {
        pergunta: "O que é 'cyberbullying'?",
        respostas: ["Jogo online de estratégia.", "Uso da internet para intimidar, assediar ou humilhar alguém.", "Forma de proteger dados online.", "Tipo de competição de hackers."],
        respostaCorreta: "Uso da internet para intimidar, assediar ou humilhar alguém."
    },
    {
        pergunta: "Importância da privacidade nas redes sociais?",
        respostas: ["Não é importante.", "Proteger informações pessoais e evitar uso indevido.", "Empresas coletarem mais dados.", "Dificultar conexão com amigos."],
        respostaCorreta: "Proteger informações pessoais e evitar uso indevido."
    },
    {
        pergunta: "O que são 'fake news'?",
        respostas: ["Notícias verdadeiras que se espalham.", "Informações falsas/enganosas apresentadas como notícias.", "Notícias sobre celebridades.", "Notícias de última hora."],
        respostaCorreta: "Informações falsas/enganosas apresentadas como notícias."
    },
    {
        pergunta: "Significado de 'viralizar' nas redes sociais?",
        respostas: ["Contrair vírus.", "Conteúdo se espalhar rapidamente e atingir grande número de pessoas.", "Tornar-se impopular.", "Ser removido da internet."],
        respostaCorreta: "Conteúdo se espalhar rapidamente e atingir grande número de pessoas."
    },
    {
        pergunta: "O que é 'geotagging' em fotos de mídias sociais?",
        respostas: ["Adicionar filtros de cores.", "Marcar localização geográfica da foto.", "Adicionar tags de pessoas.", "Compartilhar foto em várias redes."],
        respostaCorreta: "Marcar localização geográfica da foto."
    }
];

let pontuacaomedio = 0;
let tempoRestante = 15; 
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
    }
}

function hideCustomAlert() {
    if (customAlertModal) {
        customAlertModal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded disparado em scriptmedio.js");

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

    if (!perguntaElemento) console.error("Elemento 'pergunta' não encontrado!");
    if (!opcoesElemento) console.error("Elemento 'opcoes' não encontrado!");
    if (!tempoElemento) console.error("Elemento 'tempo' não encontrado!");
    if (!customAlertModal) console.error("Elemento 'customAlertModal' não encontrado!");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log("Usuário logado no quiz (Médio):", currentUser.email, "UID:", currentUser.uid);

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
    console.log("Perguntas embaralhadas (10 selecionadas):", perguntasEmbaralhadas.length, perguntasEmbaralhadas);


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
            alert("Tempo esgotado! Você não foi rápido o suficiente. Redirecionando para o início.");
            window.location.href = 'index.html';
        }
    } else {
        tempoRestante--;
    }
}

function iniciarTemporizador() {
    tempoRestante = 15;
    atualizarTemporizador();
    if (temporizador) clearInterval(temporizador);
    temporizador = setInterval(atualizarTemporizador, 1000);
}

function exibirPergunta() {
    console.log("Chamando exibirPergunta()...");
    if (!currentUser || !currentRoundId) {
        console.log("Aguardando login do usuário ou ID da rodada para exibir a pergunta...");
        return;
    }

    if (!perguntaElemento || !opcoesElemento || !tempoElemento) {
        console.error("Erro: Elementos HTML do quiz não encontrados.");
        showCustomAlert("Erro ao carregar o quiz. Verifique a estrutura da página.");
        return;
    }

    if (indicePerguntaAtual >= 10) {
        console.log("Todas as 10 perguntas foram exibidas. Exibindo resultado.");
        exibirResultado();
        return;
    }

    if (perguntasEmbaralhadas.length === 0) {
        console.error("Erro: Array de perguntas embaralhadas está vazio. Isso não deveria acontecer após embaralharPerguntas().");
        showCustomAlert("Erro ao carregar perguntas. Por favor, recarregue a página.");
        return;
    }

    const pergunta = perguntasEmbaralhadas[indicePerguntaAtual];
    console.log("Tentando exibir pergunta:", indicePerguntaAtual, pergunta);

    if (!pergunta) {
        console.error("Erro: Pergunta não encontrada no índice atual. Verifique o array de perguntas.");
        showCustomAlert("Erro ao carregar perguntas. Recarregue a página.");
        return;
    }

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
}

function selecionarResposta(perguntaOriginal, resposta) {
    pararTemporizador();

    if (resposta === perguntaOriginal.respostaCorreta) {
        pontuacaomedio++;
    }

    desabilitarRespostas(perguntaOriginal.respostaCorreta, resposta);
    setTimeout(() => {
        indicePerguntaAtual++;
        if (indicePerguntaAtual < 10) {
            exibirPergunta();
        } else {
            exibirResultado();
        }
    }, 500);
}

function pararTemporizador() {
    clearInterval(temporizador);
}

function desabilitarRespostas(respostaCorreta, respostaSelecionada) {
    const botoes = opcoesElemento.querySelectorAll(".botao");
    botoes.forEach(botao => {
        botao.disabled = true;
        if (botao.textContent === respostaCorreta) {
            botao.style.backgroundColor = 'lightgreen';
        } else if (botao.textContent === respostaSelecionada && respostaSelecionada !== respostaCorreta) {
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
            difficulty: 'medio', 
            score: pontuacao,
            timestamp: new Date(),
            roundId: currentRoundId 
        });
        console.log("Pontuação média salva com sucesso no Firestore para a rodada:", currentRoundId);
        await salvarMelhorPontuacaoUsuario(pontuacao, 'medio');
    } catch (error) {
        console.error("Erro ao salvar pontuação no Firestore:", error);
        showCustomAlert("Erro ao salvar sua pontuação. Por favor, tente novamente.");
    }
}

async function salvarMelhorPontuacaoUsuario(novaPontuacao, difficulty) {
    if (!currentUser) return;
    try {
        const userRef = doc(db, "user_profiles", currentUser.uid);
        const userDoc = await getDoc(userRef);

        let userScores = {};
        if (userDoc.exists()) {
            userScores = userDoc.data().scores || {};
        }

        const currentBest = userScores[difficulty.toLowerCase()] || 0;

        if (novaPontuacao > currentBest) {
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

async function exibirResultado() {
    pararTemporizador();
    await salvarPontuacaoFirebase(pontuacaomedio);
    localStorage.setItem('lastPlayedRoundId', currentRoundId);
    window.location.href = "resultadom.html";
}

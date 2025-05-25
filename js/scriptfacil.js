import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, collection, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { iniciarNovaRodada } from './iniciar-rodada.js';

const perguntas = [
    {
        pergunta: "Melhor senha para proteger contas?",
        respostas: ["123456", "senha", "Combinação de letras, números e símbolos", "Seu nome"],
        respostaCorreta: "Combinação de letras, números e símbolos"
    },
    {
        pergunta: "O que é um vírus de computador?",
        respostas: ["Um animal", "Um programa ruim que prejudica o computador", "Um jogo", "Um aplicativo de fotos"],
        respostaCorreta: "Um programa ruim que prejudica o computador"
    },
    {
        pergunta: "Importância de um antivírus?",
        respostas: ["Deixar o computador lento", "Proteger contra vírus", "Não serve para nada", "Só para PCs antigos"],
        respostaCorreta: "Proteger contra vírus"
    },
    {
        pergunta: "O que é um site seguro?",
        respostas: ["Com muitos anúncios", "Com um cadeado na barra de endereço", "Com jogos", "Com vídeos engraçados"],
        respostaCorreta: "Com um cadeado na barra de endereço"
    },
    {
        pergunta: "O que nunca fazer na internet?",
        respostas: ["Compartilhar fotos com amigos", "Clicar em links de estranhos", "Assistir vídeos", "Fazer compras online"],
        respostaCorreta: "Clicar em links de estranhos"
    },
    {
        pergunta: "O que é ataque de phishing?",
        respostas: ["Um tipo de peixe", "Um ataque para roubar informações", "Um jogo online", "Um aplicativo de fotos"],
        respostaCorreta: "Um ataque para roubar informações"
    },
    {
        pergunta: "Por que atualizar programas do computador?",
        respostas: ["Para deixar o PC mais lento", "Para corrigir falhas de segurança", "Não faz diferença", "Só para PCs novos"],
        respostaCorreta: "Para corrigir falhas de segurança"
    },
    {
        pergunta: "O que é um certificado SSL?",
        respostas: ["Um tipo de papel", "Um certificado para sites seguros", "Um jogo", "Um aplicativo de fotos"],
        respostaCorreta: "Um certificado para sites seguros"
    },
    {
        pergunta: "O que fazer se alguém incomodar na internet?",
        respostas: ["Xingar a pessoa", "Ignorar e bloquear", "Compartilhar com todos", "Não fazer nada"],
        respostaCorreta: "Ignorar e bloquear"
    },
    {
        pergunta: "O que é autenticação de dois fatores?",
        respostas: ["Um tipo de senha", "Uma camada extra de segurança", "Um jogo", "Um aplicativo de fotos"],
        respostaCorreta: "Uma camada extra de segurança"
    },
    {
        pergunta: "Qual programa para escrever textos?",
        respostas: ["Excel", "PowerPoint", "Word", "Paint"],
        respostaCorreta: "Word"
    },
    {
        pergunta: "Qual programa para fazer apresentações?",
        respostas: ["Word", "Excel", "PowerPoint", "Bloco de Notas"],
        respostaCorreta: "PowerPoint"
    },
    {
        pergunta: "Qual programa para fazer planilhas?",
        respostas: ["Word", "PowerPoint", "Excel", "Paint"],
        respostaCorreta: "Excel"
    },
    {
        pergunta: "O que é um computador?",
        respostas: ["Um animal", "Máquina que processa informações", "Um jogo", "Um aplicativo de fotos"],
        respostaCorreta: "Máquina que processa informações"
    },
    {
        pergunta: "Qual parte do PC guarda arquivos?",
        respostas: ["Teclado", "Mouse", "Monitor", "Disco rígido"],
        respostaCorreta: "Disco rígido"
    },
    {
        pergunta: "O que é a internet?",
        respostas: ["Um jogo", "Rede mundial de computadores", "Editor de texto", "Navegador de internet"],
        respostaCorreta: "Rede mundial de computadores"
    },
    {
        pergunta: "Qual a função do mouse?",
        respostas: ["Mostrar imagens", "Digitar textos", "Mover o cursor na tela", "Imprimir documentos"],
        respostaCorreta: "Mover o cursor na tela"
    },
    {
        pergunta: "O que é um teclado?",
        respostas: ["Dispositivo para digitar", "Dispositivo para mostrar imagens", "Um programa", "Um jogo"],
        respostaCorreta: "Dispositivo para digitar"
    },
    {
        pergunta: "Qual programa para navegar na internet?",
        respostas: ["Word", "Excel", "Navegador (Chrome, Firefox, etc.)", "PowerPoint"],
        respostaCorreta: "Navegador (Chrome, Firefox, etc.)"
    },
    {
        pergunta: "O que é um arquivo?",
        respostas: ["Um tipo de comida", "Conjunto de informações guardado no computador", "Um jogo", "Um aplicativo de fotos"],
        respostaCorreta: "Conjunto de informações guardado no computador"
    },
    {
        pergunta: "O que é IA?",
        respostas: ["Um tipo de robô", "Inteligência Artificial", "Um jogo", "Um aplicativo de fotos"],
        respostaCorreta: "Inteligência Artificial"
    },
    {
        pergunta: "O que a IA pode fazer?",
        respostas: ["Apenas jogar jogos", "Aprender e resolver problemas", "Editar fotos", "Tocar música"],
        respostaCorreta: "Aprender e resolver problemas"
    },
    {
        pergunta: "O que é um robô com IA?",
        respostas: ["Um tipo de planta", "Robô que pensa e age sozinho", "Um jogo", "Um aplicativo de música"],
        respostaCorreta: "Robô que pensa e age sozinho"
    },
    {
        pergunta: "Onde a IA é usada na medicina?",
        respostas: ["Criar jogos", "Ajudar a diagnosticar doenças", "Editar fotos", "Tocar música"],
        respostaCorreta: "Ajudar a diagnosticar doenças"
    },
    {
        pergunta: "O que a IA faz com a linguagem humana?",
        respostas: ["Cria um novo idioma", "Entende e processa a linguagem humana", "Cria jogos", "Edita fotos"],
        respostaCorreta: "Entende e processa a linguagem humana"
    },
    {
        pergunta: "O que a IA faz na robótica?",
        respostas: ["Cria robôs inteligentes", "Edita fotos", "Toca música", "Joga jogos"],
        respostaCorreta: "Cria robôs inteligentes"
    },
    {
        pergunta: "O que a IA faz com imagens?",
        respostas: ["Cria músicas", "Analisa e entende imagens", "Cria jogos", "Edita textos"],
        respostaCorreta: "Analisa e entende imagens"
    },
    {
        pergunta: "Onde a IA é usada no marketing?",
        respostas: ["Criar jogos", "Mostrar anúncios personalizados", "Editar fotos", "Tocar música"],
        respostaCorreta: "Mostrar anúncios personalizados"
    },
    {
        pergunta: "O que é um chatbot?",
        respostas: ["Um tipo de robô", "Programa que conversa com pessoas", "Um jogo", "Um aplicativo de fotos"],
        respostaCorreta: "Programa que conversa com pessoas"
    },
    {
        pergunta: "O que a IA faz em carros que dirigem sozinhos?",
        respostas: ["Cria jogos", "Ajuda a dirigir o carro", "Edita fotos", "Toca música"],
        respostaCorreta: "Ajuda a dirigir o carro"
    },
    { pergunta: "Quem inventou o telefone?", respostas: ["Thomas Edison", "Alexander Graham Bell", "Albert Einstein", "Isaac Newton"], respostaCorreta: "Alexander Graham Bell" },
    { pergunta: "Primeiro computador pessoal?", respostas: ["ENIAC", "Apple I", "IBM PC", "Altair 8800"], respostaCorreta: "Altair 8800" },
    { pergunta: "Quem inventou a lâmpada?", respostas: ["Nikola Tesla", "Thomas Edison", "Marie Curie", "Galileu Galilei"], respostaCorreta: "Thomas Edison" },
    { pergunta: "Primeira linguagem de programação?", respostas: ["Java", "C", "FORTRAN", "Python"], respostaCorreta: "FORTRAN" },
    { pergunta: "Quem criou a World Wide Web?", respostas: ["Steve Jobs", "Bill Gates", "Tim Berners-Lee", "Mark Zuckerberg"], respostaCorreta: "Tim Berners-Lee" },
    { pergunta: "Primeiro sistema operacional?", respostas: ["Windows", "MacOS", "Unix", "MS-DOS"], respostaCorreta: "MS-DOS" },
    { pergunta: "Quem inventou o transistor?", respostas: ["Albert Einstein", "Isaac Newton", "John Bardeen", "Marie Curie"], respostaCorreta: "John Bardeen" },
    { pergunta: "Primeiro videogame comercial?", respostas: ["Atari", "Pong", "Nintendo", "PlayStation"], respostaCorreta: "Pong" },
    { pergunta: "Quem inventou a internet?", respostas: ["Vint Cerf", "Tim Berners-Lee", "Steve Jobs", "Bill Gates"], respostaCorreta: "Vint Cerf" },
    { pergunta: "Primeiro celular comercial?", respostas: ["Motorola DynaTAC 8000x", "Nokia 3310", "iPhone", "BlackBerry"], respostaCorreta: "Motorola DynaTAC 8000x" },
    { pergunta: "O que é uma rede social?", respostas: ["Um jogo", "Um site para pessoas", "Uma loja", "Um aplicativo de música"], respostaCorreta: "Um site para pessoas" },
    { pergunta: "Qual rede social é famosa por fotos e vídeos?", respostas: ["Twitter", "Instagram", "LinkedIn", "TikTok"], respostaCorreta: "Instagram" },
    { pergunta: "Qual rede social é conhecida por vídeos curtos?", respostas: ["Facebook", "Twitter", "TikTok", "LinkedIn"], respostaCorreta: "TikTok" },
    { pergunta: "O que significa 'like'?", respostas: ["Um jogo", "Um botão de 'gostar'", "Uma marca", "Um tipo de vídeo"], respostaCorreta: "Um botão de 'gostar'" },
    { pergunta: "O que é uma 'hashtag'?", respostas: ["Um jogo", "Uma palavra com '#'", "Uma música", "Um tipo de filtro"], respostaCorreta: "Uma palavra com '#'" },
    { pergunta: "O que são 'stories'?", respostas: ["Jogos", "Vídeos curtos que somem", "Livros", "Tipos de aplicativos"], respostaCorreta: "Vídeos curtos que somem" },
    { pergunta: "O que é um 'tweet'?", respostas: ["Um jogo", "Uma mensagem curta", "Um vídeo longo", "Um tipo de foto"], respostaCorreta: "Uma mensagem curta" },
    { pergunta: "O que é um 'perfil'?", respostas: ["Um jogo", "Uma página pessoal", "Um vídeo", "Um tipo de música"], respostaCorreta: "Uma página pessoal" },
    { pergunta: "O que é um 'meme'?", respostas: ["Um jogo", "Uma imagem engraçada", "Um vídeo de dança", "Um tipo de filtro"], respostaCorreta: "Uma imagem engraçada" },
    { pergunta: "O que é 'comunidade' em redes sociais?", respostas: ["Um jogo", "Uma pessoa que acompanha seu perfil", "Um tipo de vídeo", "Um aplicativo de edição"], respostaCorreta: "Uma pessoa que acompanha seu perfil" }
];

let pontuacaofacil = 0;
let tempoRestante = 10;
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
    console.log("DOMContentLoaded disparado em scriptfacil.js");

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
            console.log("Usuário logado no quiz (Fácil):", currentUser.email, "UID:", currentUser.uid);

            currentRoundId = localStorage.getItem('currentQuizRoundId');
            if (!currentRoundId) {
                console.log("Nenhum ID de rodada encontrado. Iniciando uma nova rodada automaticamente.");
                currentRoundId = await iniciarNovaRodada();
                console.log("Nova rodada iniciada com ID:", currentRoundId);
            } else {
                console.log("ID da rodada atual encontrado:", currentRoundId);
            }

            embaralharPerguntas();
            console.log("Perguntas embaralhadas após login:", perguntasEmbaralhadas.length);
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
    tempoRestante = 10;
    atualizarTemporizador();
    if (temporizador) clearInterval(temporizador);
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
            console.error("Erro: Array de perguntas embaralhadas está vazio. Isso não deveria acontecer após embaralharPerguntas().");
            showCustomAlert("Erro ao carregar perguntas. Por favor, recarregue a página.");
            return;
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

function selecionarResposta(perguntaOriginal, resposta) {
    pararTemporizador();

    if (resposta === perguntaOriginal.respostaCorreta) {
        pontuacaofacil++;
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
            difficulty: 'facil',
            score: pontuacao,
            timestamp: new Date(),
            roundId: currentRoundId
        });
        console.log("Pontuação fácil salva com sucesso no Firestore para a rodada:", currentRoundId);
        await salvarMelhorPontuacaoUsuario(pontuacao, 'facil');
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
    await salvarPontuacaoFirebase(pontuacaofacil);
    localStorage.setItem('lastPlayedRoundId', currentRoundId);
    window.location.href = "resultado.html";
}
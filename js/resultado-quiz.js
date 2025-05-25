import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded disparado em resultado-quiz.js"); 
    const resultadoElemento = document.getElementById("resultado");
    const mensagemElemento = document.getElementById("mensagem");
    const imagemElemento = document.getElementById("imagemResultado");
    const containerDiv = document.getElementById("container");
    const customAlertModal = document.getElementById('customAlertModal');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertCloseButton = document.getElementById('customAlertCloseButton');
    if (!resultadoElemento) console.error("Elemento 'resultado' não encontrado!");
    else console.log("Elemento 'resultado' encontrado:", resultadoElemento);
    if (!mensagemElemento) console.error("Elemento 'mensagem' não encontrado!");
    else console.log("Elemento 'mensagem' encontrado:", mensagemElemento);
    if (!imagemElemento) console.error("Elemento 'imagemResultado' não encontrado!");
    else console.log("Elemento 'imagemResultado' encontrado:", imagemElemento);
    if (!containerDiv) console.error("Elemento 'container' não encontrado!");
    else console.log("Elemento 'container' encontrado:", containerDiv);
    if (!customAlertModal) console.error("Elemento 'customAlertModal' não encontrado!");
    else console.log("Elemento 'customAlertModal' encontrado:", customAlertModal);

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
    if (customAlertCloseButton) {
        customAlertCloseButton.addEventListener('click', hideCustomAlert);
    }

    let currentUser = null; 

    onAuthStateChanged(auth, (user) => {
        console.log("onAuthStateChanged disparado. Usuário:", user); 
        if (user) {
            currentUser = user;
            console.log("Usuário logado na página de resultado:", currentUser.email, "UID:", currentUser.uid);
            processarEExibirResultado();
        } else {
            currentUser = null;
            console.warn("Nenhum usuário logado. Redirecionando para login.");
            localStorage.setItem('redirectAfterLogin', window.location.href);
            showCustomAlert('Você precisa estar logado para ver seus resultados!', () => {
                window.location.href = 'login.html';
            });
        }
    });

    function getQuizDifficultyFromURL() {
        const path = window.location.pathname;
        if (path.includes('resultadof.html')) { 
            return 'dificil';
        } else if (path.includes('resultadom.html')) {
            return 'medio';
        } else if (path.includes('resultado.html')) { 
            return 'facil';
        }
        return 'desconhecida'; 
    }

    async function processarEExibirResultado() {
        console.log("Chamando processarEExibirResultado()..."); 
        if (!currentUser) {
            console.warn("Usuário não autenticado para buscar resultado.");
            resultadoElemento.textContent = "Por favor, faça login para ver seus resultados.";
            mensagemElemento.textContent = "";
            return;
        }

        const dificuldadeQuiz = getQuizDifficultyFromURL(); 
        console.log(`Buscando pontuações para o nível: ${dificuldadeQuiz} e UID: ${currentUser.uid}`); 

        let pontuacaoRodadaAtual = null;
        let melhorPontuacaoHistorica = 0;

        try {
            const scoresQuery = query(
                collection(db, "scores"),
                where("userId", "==", currentUser.uid),
                where("difficulty", "==", dificuldadeQuiz),
                orderBy("timestamp", "desc"),
                limit(1)
            );
            const querySnapshot = await getDocs(scoresQuery);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                pontuacaoRodadaAtual = docSnap.data().score;
                console.log("Pontuação da rodada recuperada do Firestore:", pontuacaoRodadaAtual);
            } else {
                console.warn(`Nenhuma pontuação de rodada encontrada para o usuário no nível ${dificuldadeQuiz}.`);
            }
            const userProfileRef = doc(db, "user_profiles", currentUser.uid);
            const userProfileDoc = await getDoc(userProfileRef);

            if (userProfileDoc.exists()) {
                const userData = userProfileDoc.data();
                if (userData.scores && userData.scores[dificuldadeQuiz]) {
                    melhorPontuacaoHistorica = userData.scores[dificuldadeQuiz];
                    console.log("Melhor pontuação histórica recuperada do Firestore:", melhorPontuacaoHistorica);
                } else {
                    console.warn(`Nenhuma melhor pontuação histórica encontrada para ${dificuldadeQuiz} no perfil do usuário.`);
                }
            } else {
                console.warn("Perfil do usuário não encontrado no Firestore.");
            }

        } catch (error) {
            console.error("Erro ao recuperar pontuações do Firestore:", error);
            resultadoElemento.innerHTML = `Erro ao carregar seus resultados para o quiz ${dificuldadeQuiz}. Tente jogar novamente.`;
            mensagemElemento.textContent = "";
            return;
        }
        if (pontuacaoRodadaAtual !== null) {
            console.log("Pontuação da rodada atual não é nula. Exibindo resultados visuais.");
            resultadoElemento.innerHTML = `
                <p>Pontuação da Rodada: <span id="pontuacaoRodadaValor">${pontuacaoRodadaAtual}</span> de 10 perguntas!</p>
                <p>Seu resultado foi de <span id="percentualRodada">${(pontuacaoRodadaAtual / 10) * 100}%</span>!</p>
                <p>Sua Melhor Pontuação Histórica neste nível: <span id="melhorPontuacaoValor">${melhorPontuacaoHistorica}</span></p>
            `;
            if (pontuacaoRodadaAtual < 7) { 
                mensagemElemento.textContent = "Infelizmente você não passou para o próximo nível. Obrigado por jogar!";
                if (imagemElemento) {
                    imagemElemento.src = "imagens/triste.png";
                    imagemElemento.alt = "Imagem de reprovação";
                }
            } else { 
                mensagemElemento.textContent = "Parabéns! Você passou para o próximo nível!";
                if (imagemElemento) {
                    imagemElemento.src = "imagens/feliz.png";
                    imagemElemento.alt = "Imagem de aprovação";
                }
                let proximoNivelURL = '';
                if (dificuldadeQuiz === 'facil') {
                    proximoNivelURL = 'medio.html';
                } else if (dificuldadeQuiz === 'medio') {
                    proximoNivelURL = 'dificil.html'; 
                }

                if (proximoNivelURL) {
                    const botaoProximoNivel = document.createElement("button");
                    botaoProximoNivel.textContent = "Próximo Nível";
                    botaoProximoNivel.classList.add("botao-resultado", "mt-4"); 

                    botaoProximoNivel.addEventListener('click', function () {
                        window.location.href = proximoNivelURL;
                    });

                    let botoesContainerDiv = document.getElementById("botoes-container");
                    if (!botoesContainerDiv) {
                        botoesContainerDiv = document.createElement("div");
                        botoesContainerDiv.id = "botoes-container";
                        botoesContainerDiv.classList.add("flex", "flex-col", "items-center", "space-y-4", "mt-6"); 
                        if (containerDiv) {
                            containerDiv.appendChild(botoesContainerDiv);
                        }
                    }
                    botoesContainerDiv.appendChild(botaoProximoNivel);
                    console.log(`Botão 'Próximo Nível' (${proximoNivelURL}) adicionado.`);
                } else if (dificuldadeQuiz === 'dificil') {
                    mensagemElemento.textContent = "Parabéns! Você concluiu todos os Quizzes!";
                }
            }

        } else {
            resultadoElemento.innerHTML = `Nenhum resultado encontrado para o quiz ${dificuldadeQuiz}. Por favor, jogue o quiz primeiro.`;
            mensagemElemento.textContent = "";
            console.log("Pontuação da rodada atual é nula. Exibindo mensagem de quiz não jogado.");
        }
        const botaoFinalizarQuiz = document.createElement("button");
        botaoFinalizarQuiz.textContent = "Finalizar Quiz";
        botaoFinalizarQuiz.classList.add("botao-resultado", "mt-4");

        botaoFinalizarQuiz.addEventListener('click', function () {
            window.location.href = 'resultadofinal.html'; 
        });

        let botoesContainerDiv = document.getElementById("botoes-container");
        if (!botoesContainerDiv) {
            botoesContainerDiv = document.createElement("div");
            botoesContainerDiv.id = "botoes-container";
            botoesContainerDiv.classList.add("flex", "flex-col", "items-center", "space-y-4", "mt-6");
            if (containerDiv) {
                containerDiv.appendChild(botoesContainerDiv);
            }
        }
        botoesContainerDiv.appendChild(botaoFinalizarQuiz);
        console.log("Botão 'Finalizar Quiz' adicionado.");
    }
});

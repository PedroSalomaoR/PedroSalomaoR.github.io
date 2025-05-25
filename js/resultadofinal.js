import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded disparado em resultadofinal.js");
    const resultadoElemento = document.getElementById("resultado");
    const mensagemElemento = document.getElementById("mensagem");
    const botaoVoltarInicio = document.getElementById("voltaraoinicio");
    const finalizarRodadaButton = document.getElementById("finalizarRodadaButton"); 
    const imagemElemento = document.getElementById("imagemResultado");
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const customAlertModal = document.getElementById('customAlertModal');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertCloseButton = document.getElementById('customAlertCloseButton');
    function showCustomAlert(message, callback = null) {
        console.log(`Exibindo alerta customizado: ${message}`);
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
        console.log("onAuthStateChanged disparado. Usuário:", user ? user.email : "Nenhum");
        if (user) {
            currentUser = user;
            console.log("Usuário logado na página de resultado final:", currentUser.email, "UID:", currentUser.uid);
            exibirResultadosFinais();
        } else {
            currentUser = null;
            console.warn("Nenhum usuário logado. Redirecionando para login.");
            localStorage.setItem('redirectAfterLogin', window.location.href);
            showCustomAlert('Você precisa estar logado para ver seus resultados!', () => {
                window.location.href = 'login.html';
            });
        }
    });
    function formatarPorcentagem(pontuacao, totalPerguntas) {
        if (totalPerguntas === 0) return "0%";
        const porcentagem = (pontuacao / totalPerguntas) * 100;
        if (Number.isInteger(porcentagem)) {
            return `${porcentagem}%`;
        } else {
            return `${porcentagem.toFixed(2)}%`;
        }
    }
    async function exibirResultadosFinais() {
        console.log("Função exibirResultadosFinais() iniciada.");
        if (!currentUser) {
            console.error("Erro: currentUser é nulo ao tentar exibir resultados finais.");
            resultadoElemento.textContent = "Erro: Usuário não autenticado. Faça login para ver seus resultados.";
            mensagemElemento.textContent = "";
            return;
        }

        if (userEmailDisplay) {
            userEmailDisplay.textContent = `Usuário: ${currentUser.email}`;
            console.log(`Email do usuário exibido: ${currentUser.email}`);
        }
        const lastPlayedRoundId = localStorage.getItem('lastPlayedRoundId');
        if (!lastPlayedRoundId) {
            console.warn("Nenhum ID de rodada encontrado no localStorage. Exibindo mensagem padrão.");
            resultadoElemento.innerHTML = "<p class='text-lg font-semibold text-gray-600'>Nenhuma rodada de quiz concluída ainda. Jogue para ver sua pontuação!</p>";
            mensagemElemento.textContent = "Que tal começar com o quiz fácil?";
            if (finalizarRodadaButton) finalizarRodadaButton.classList.add('hidden');
            return;
        }

        let pontuacaoFacil = 0;
        let pontuacaoMedio = 0;
        let pontuacaoDificil = 0;
        let pontuacaoTotal = 0;
        let totalQuestionsConsidered = 0;

        try {
            console.log(`Tentando buscar pontuações para a rodada ID: ${lastPlayedRoundId} e UID: ${currentUser.uid}`);
            const scoresQuery = query(
                collection(db, "scores"),
                where("userId", "==", currentUser.uid),
                where("roundId", "==", lastPlayedRoundId),
                orderBy("timestamp", "desc")
            );
            const querySnapshot = await getDocs(scoresQuery);

            if (!querySnapshot.empty) {
                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.difficulty === 'facil') {
                        pontuacaoFacil = data.score || 0;
                        totalQuestionsConsidered += 10;
                    } else if (data.difficulty === 'medio') {
                        pontuacaoMedio = data.score || 0;
                        totalQuestionsConsidered += 10;
                    } else if (data.difficulty === 'dificil') {
                        pontuacaoDificil = data.score || 0;
                        totalQuestionsConsidered += 10;
                    }
                });
                pontuacaoTotal = pontuacaoFacil + pontuacaoMedio + pontuacaoDificil;
                console.log(`Pontuações recuperadas para a rodada ${lastPlayedRoundId}: Fácil=${pontuacaoFacil}, Médio=${pontuacaoMedio}, Difícil=${pontuacaoDificil}`);
            } else {
                console.log(`Nenhuma pontuação encontrada para a rodada ${lastPlayedRoundId} e usuário.`);
                resultadoElemento.innerHTML = "<p class='text-lg font-semibold text-gray-600'>Nenhuma pontuação encontrada para a última rodada jogada.</p>";
                mensagemElemento.textContent = "Que tal iniciar um novo quiz?";
                if (finalizarRodadaButton) finalizarRodadaButton.classList.add('hidden');
                return;
            }
            const overallPercentage = formatarPorcentagem(pontuacaoTotal, totalQuestionsConsidered);
            const numericOverallPercentage = parseFloat(overallPercentage);
            let resultadosHtml = `
                <h2 class="text-xl font-semibold text-gray-700 mb-4">Suas Pontuações da Última Rodada:</h2>
                <div class="space-y-2">
                    <p class="text-lg font-semibold">Fácil: <span class="font-bold text-blue-600">${pontuacaoFacil}</span> de 10 (${formatarPorcentagem(pontuacaoFacil, 10)})</p>
                    <p class="text-lg font-semibold">Médio: <span class="font-bold text-green-600">${pontuacaoMedio}</span> de 10 (${formatarPorcentagem(pontuacaoMedio, 10)})</p>
                    <p class="text-lg font-semibold">Difícil: <span class="font-bold text-red-600">${pontuacaoDificil}</span> de 10 (${formatarPorcentagem(pontuacaoDificil, 10)})</p>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mt-6 mb-4">Pontuação Total da Rodada: <span class="text-purple-700">${pontuacaoTotal}</span> de ${totalQuestionsConsidered} (${overallPercentage})</h2>
            `;
            if (numericOverallPercentage >= 70) {
                mensagemElemento.textContent = "Uau! Você é um mestre do conhecimento tecnológico! Parabéns pelo seu desempenho incrível nesta rodada!";
                if (imagemElemento) {
                    imagemElemento.src = "imagens/comemorando.png";
                    imagemElemento.alt = "Imagem de comemoração";
                }
            } else {
                mensagemElemento.textContent = "É um ótimo começo! Cada quiz é uma oportunidade de aprender. Que tal iniciar uma nova rodada?";
                if (imagemElemento) {
                    imagemElemento.src = "imagens/triste.png";
                    imagemElemento.alt = "Imagem de tristeza";
                }
            }

            console.log(`Resultados HTML gerados. Pontuação Total da Rodada: ${pontuacaoTotal} de ${totalQuestionsConsidered} (${overallPercentage})`);
            resultadoElemento.innerHTML = resultadosHtml;
            if (finalizarRodadaButton) finalizarRodadaButton.classList.remove('hidden');

        } catch (error) {
            console.error("Erro ao carregar resultados finais do Firestore:", error);
            showCustomAlert("Erro ao carregar seus resultados. Por favor, tente novamente mais tarde.");
            resultadoElemento.innerHTML = "<p>Erro ao carregar seus resultados.</p>";
            mensagemElemento.textContent = "";
            if (finalizarRodadaButton) finalizarRodadaButton.classList.add('hidden');
        }
    }
    if (botaoVoltarInicio) {
        botaoVoltarInicio.addEventListener('click', function() {
            console.log("Botão 'Voltar para o início' clicado. Redirecionando para o dashboard.");
            window.location.href = 'dashboard.html';
        });
    }
    if (finalizarRodadaButton) {
        finalizarRodadaButton.addEventListener('click', () => {
            console.log("Botão 'Finalizar Rodada' clicado. Limpando currentQuizRoundId.");
            localStorage.removeItem('currentQuizRoundId');
            showCustomAlert('Rodada finalizada! Você pode iniciar uma nova rodada no Dashboard.', () => {
                window.location.href = 'dashboard.html'; 
            });
        });
    }
});

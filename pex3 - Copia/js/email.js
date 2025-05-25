import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const userEmailInput = document.getElementById('userEmail');
    const emailScoreForm = document.getElementById('emailScoreForm');
    const emailStatusParagraph = document.getElementById('emailStatus');
    const backToDashboardButton = document.getElementById('backToDashboardButton');
    const scoreFacilDisplay = document.getElementById('scoreFacil');
    const scoreMedioDisplay = document.getElementById('scoreMedio');
    const scoreDificilDisplay = document.getElementById('scoreDificil');
    const formspreeScoreForm = document.getElementById('formspreeScoreForm');
    const formUserEmail = document.getElementById('formUserEmail');
    const formUserName = document.getElementById('formUserName'); 
    const formScoreFacil = document.getElementById('formScoreFacil');
    const formScoreMedio = document.getElementById('formScoreMedio');
    const formScoreDificil = document.getElementById('formScoreDificil');
    const formEmailSubject = document.getElementById('formEmailSubject');
    const customAlertModal = document.getElementById('customAlertModal');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertCloseButton = document.getElementById('customAlertCloseButton');

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

    if (customAlertCloseButton) {
        customAlertCloseButton.addEventListener('click', hideCustomAlert);
    }

    let currentUser = null; 

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log("Usuário logado na página de e-mail:", currentUser.email, "UID:", currentUser.uid);
            await loadAndDisplayScores(currentUser.uid, currentUser.email);
        } else {
            currentUser = null;
            console.warn("Nenhum usuário logado. Redirecionando para login.");
            localStorage.setItem('redirectAfterLogin', window.location.href);
            showCustomAlert('Você precisa estar logado para ver e enviar suas pontuações por e-mail!', () => {
                window.location.href = 'login.html';
            });
        }
    });

    async function loadAndDisplayScores(uid, email) {
        const username = email.includes('@') ? email.split('@')[0] : email;
        userEmailInput.value = email;

        let scoreFacil = '0';
        let scoreMedio = '0';
        let scoreDificil = '0';

        const lastPlayedRoundId = localStorage.getItem('lastPlayedRoundId');

        if (!lastPlayedRoundId) {
            console.warn("Nenhum 'lastPlayedRoundId' encontrado no localStorage. Não é possível carregar pontuações da última rodada.");
            showCustomAlert("Nenhuma rodada de quiz foi concluída ainda. Jogue um quiz para ver suas pontuações aqui!");
            scoreFacilDisplay.textContent = '0';
            scoreMedioDisplay.textContent = '0';
            scoreDificilDisplay.textContent = '0';
            formScoreFacil.value = '0';
            formScoreMedio.value = '0';
            formScoreDificil.value = '0';
            formEmailSubject.value = `Suas Pontuações de Quiz - ${username} (Nenhuma Rodada)`;
            return;
        }

        try {
            const scoresQuery = query(
                collection(db, "scores"),
                where("userId", "==", uid),
                where("roundId", "==", lastPlayedRoundId)
            );
            const querySnapshot = await getDocs(scoresQuery);

            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    const scoreData = doc.data();
                    if (scoreData.difficulty === 'facil' && typeof scoreData.score === 'number') {
                        scoreFacil = scoreData.score.toString();
                    } else if (scoreData.difficulty === 'medio' && typeof scoreData.score === 'number') {
                        scoreMedio = scoreData.score.toString();
                    } else if (scoreData.difficulty === 'dificil' && typeof scoreData.score === 'number') {
                        scoreDificil = scoreData.score.toString();
                    }
                });
                console.log("Pontuações da última rodada carregadas do Firestore:", { facil: scoreFacil, medio: scoreMedio, dificil: scoreDificil });

            } else {
                console.warn(`Nenhuma pontuação encontrada para a rodada ${lastPlayedRoundId} e usuário ${uid}.`);
                showCustomAlert("Não foi possível encontrar as pontuações da sua última rodada. Tente jogar um quiz novamente.");
            }
        } catch (error) {
            console.error("Erro ao carregar pontuações da última rodada do Firestore:", error);
            showCustomAlert("Erro ao carregar suas pontuações. Tente novamente mais tarde.");
        }
        scoreFacilDisplay.textContent = scoreFacil;
        scoreMedioDisplay.textContent = scoreMedio;
        scoreDificilDisplay.textContent = scoreDificil;
        formUserEmail.value = email; 
        formUserName.value = username; 
        formScoreFacil.value = scoreFacil;
        formScoreMedio.value = scoreMedio;
        formScoreDificil.value = scoreDificil;
        formEmailSubject.value = `Suas Pontuações da Última Rodada de Quiz - ${username}`; 
    }
    emailScoreForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const userEmail = userEmailInput.value.trim(); 

        if (!userEmail) {
            emailStatusParagraph.textContent = 'Por favor, insira seu endereço de e-mail.';
            emailStatusParagraph.className = 'message error';
            return;
        }
        const currentScoreFacil = formScoreFacil.value;
        const currentScoreMedio = formScoreMedio.value;
        const currentScoreDificil = formScoreDificil.value;
        const currentUsername = formUserName.value; 

        emailStatusParagraph.textContent = 'Enviando suas pontuações...';
        emailStatusParagraph.className = 'message';

        try {
            const response = await fetch(formspreeScoreForm.action, {
                method: 'POST',
                body: new FormData(formspreeScoreForm),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                emailStatusParagraph.textContent = 'Suas pontuações foram enviadas com sucesso para o e-mail fornecido!';
                emailStatusParagraph.className = 'message success';
            } else {
                const data = await response.json();
                console.error('Erro no Formspree:', data);
                emailStatusParagraph.textContent = `Erro ao enviar e-mail: ${data.errors ? data.errors.map(err => err.message).join(', ') : 'Erro desconhecido'}`;
                emailStatusParagraph.className = 'message error';
            }
        } catch (error) {
            console.error('Erro de conexão ao enviar e-mail:', error);
            emailStatusParagraph.textContent = 'Erro de conexão. Verifique sua internet.';
            emailStatusParagraph.className = 'message error';
        }
    });
    backToDashboardButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
});
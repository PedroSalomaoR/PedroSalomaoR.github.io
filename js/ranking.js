import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {
    const rankingListDiv = document.getElementById('rankingList');
    const backToDashboardButton = document.getElementById('backToDashboardButton');
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

    let loggedInUserEmail = null; 
    let displayUsername = 'Usuário'; 
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            loggedInUserEmail = user.email;
            displayUsername = loggedInUserEmail.includes('@') ? loggedInUserEmail.split('@')[0] : loggedInUserEmail;
            console.log(`Bem-vindo ao Ranking, ${displayUsername}!`);
            await displayRanking(); 
        } else {
            loggedInUserEmail = null;
            displayUsername = 'Usuário';
            console.warn("Nenhum usuário logado. Redirecionando para login.");
            localStorage.setItem('redirectAfterLogin', window.location.href);
            showCustomAlert('Você precisa estar logado para acessar o Ranking!', () => {
                window.location.href = 'login.html';
            });
        }
    });

    function calculateTotalScore(scores) {
        if (!scores) return 0;
        let total = 0;
        total += (scores.facil || 0);
        total += (scores.medio || 0);
        total += (scores.dificil || 0);
        return total;
    }

    async function displayRanking() {
        if (!loggedInUserEmail) {
            console.warn("Usuário não logado, não é possível exibir o ranking.");
            rankingListDiv.innerHTML = '<p class="info-message">Por favor, faça login para ver o Ranking.</p>';
            return;
        }

        let usersWithTotalScores = [];
        try {
            const querySnapshot = await getDocs(collection(db, "user_profiles"));

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const userEmail = userData.email;
                const username = userEmail && userEmail.includes('@') ? userEmail.split('@')[0] : userEmail || 'Desconhecido';
                const scores = userData.scores || {};
                const totalScore = calculateTotalScore(scores);
                if (totalScore > 0) {
                    usersWithTotalScores.push({
                        username: username,
                        totalScore: totalScore
                    });
                }
            });
            usersWithTotalScores.sort((a, b) => b.totalScore - a.totalScore);
            const top10Users = usersWithTotalScores.slice(0, 10);

            if (top10Users.length === 0) {
                rankingListDiv.innerHTML = '<p class="info-message">Nenhum jogador pontuou ainda. Seja o primeiro!</p>';
                return;
            }

            let rankingTableHTML = `
                <table class="ranking-table">
                    <thead>
                        <tr>
                            <th>Posição</th>
                            <th>Jogador</th>
                            <th class="score-column">Pontuação Total</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            top10Users.forEach((user, index) => {
                let medalClass = '';
                if (index === 0) {
                    medalClass = 'gold-medal';
                } else if (index === 1) {
                    medalClass = 'silver-medal';
                } else if (index === 2) {
                    medalClass = 'bronze-medal';
                }
                const currentUserClass = user.username === displayUsername ? 'highlight-user' : '';
                const rowClasses = `${medalClass} ${currentUserClass}`.trim();

                rankingTableHTML += `
                    <tr class="${rowClasses}">
                        <td>${index + 1}º</td>
                        <td>${user.username}</td>
                        <td class="score-column">${user.totalScore}</td>
                    </tr>
                `;
            });

            rankingTableHTML += `
                    </tbody>
                </table>
            `;

            rankingListDiv.innerHTML = rankingTableHTML;

        } catch (error) {
            console.error("Erro ao carregar ranking do Firestore:", error);
            rankingListDiv.innerHTML = '<p class="error-message">Erro ao carregar o ranking. Tente novamente mais tarde.</p>';
        }
    }
    backToDashboardButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
});

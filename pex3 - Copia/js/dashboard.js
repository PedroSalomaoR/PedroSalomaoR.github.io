import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";



document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutButton = document.getElementById('logoutButton');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const email = user.email;
            const username = email && email.includes('@') ? email.split('@')[0] : email;

            welcomeMessage.textContent = `Bem-vindo(a), ${username}!`; 
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', user.email); 
            console.log(`Usuário logado no dashboard: ${username}`);

        } else {
            localStorage.removeItem('isLoggedIn'); 
            localStorage.removeItem('loggedInUser');
            localStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return; 
        }
    });

    if (logoutButton) { 
        logoutButton.addEventListener('click', async () => { 
            try {
                await signOut(auth); 
                console.log("Usuário deslogado do Firebase.");
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('redirectAfterLogin'); 
                window.location.href = 'login.html'; 

            } catch (error) {
                console.error("Erro ao fazer logout:", error);
                alert("Erro ao fazer logout. Tente novamente.");
            }
        });
    } else {
        console.warn("Botão de logout com ID 'logoutButton' não encontrado.");
    }

    const finalizarRodadaButton = document.getElementById('iniciarquiz');
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

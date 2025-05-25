import { auth } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { iniciarNovaRodada } from './iniciar-rodada.js';

let currentUser = null;

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
        console.error("Elementos do customAlertModal não encontrados. Exibindo alerta padrão.");
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


onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log("Usuário logado no index:", user.email);
        const authLink = document.getElementById('authLink');
        if (authLink) {
            authLink.textContent = `Olá, ${user.email.split('@')[0]}!`;
            authLink.href = 'dashboard.html'; 
        }
    } else {
        console.log("Nenhum usuário logado no index.");
        const authLink = document.getElementById('authLink');
        if (authLink) {
            authLink.textContent = 'Acesse sua conta';
            authLink.href = 'login.html';
        }
    }
});



window.startQuizLevel = async (level) => {
    console.log(`[DEBUG - scriptindex.js] startQuizLevel chamado para o nível: ${level}`);

    if (!currentUser) {
        console.warn("[DEBUG - scriptindex.js] Usuário não logado. Exibindo alerta.");
        showCustomAlert('Você precisa estar logado para iniciar um quiz!', () => {
            localStorage.setItem('redirectAfterLogin', `index.html`); // 
            window.location.href = 'login.html';
        });
        return;
    }

    try {
        console.log("[DEBUG - scriptindex.js] Limpando IDs de rodada anteriores do localStorage...");
        localStorage.removeItem('currentQuizRoundId'); 
        localStorage.removeItem('lastPlayedRoundId'); 
        console.log("[DEBUG - scriptindex.js] IDs de rodada limpos. currentQuizRoundId no localStorage:", localStorage.getItem('currentQuizRoundId'));


        console.log("[DEBUG - scriptindex.js] Chamando iniciarNovaRodada()...");
        const newRoundId = await iniciarNovaRodada();
        console.log("[DEBUG - scriptindex.js] iniciarNovaRodada() retornou:", newRoundId);

        if (newRoundId) {
            localStorage.setItem('currentQuizRoundId', newRoundId);
            console.log(`[DEBUG - scriptindex.js] Nova rodada ${newRoundId} iniciada para o nível ${level}. ID salvo no localStorage.`);
            console.log("[DEBUG - scriptindex.js] currentQuizRoundId no localStorage APÓS SET:", localStorage.getItem('currentQuizRoundId'));

            
            let redirectUrl = '';
            if (level === 'facil') {
                redirectUrl = 'facil.html';
            } else if (level === 'medio') {
                redirectUrl = 'medio.html';
            } else if (level === 'dificil') {
                redirectUrl = 'dificil.html';
            } else {
                showCustomAlert('Nível de quiz inválido.');
                return;
            }
            console.log(`[DEBUG - scriptindex.js] Redirecionando para: ${redirectUrl}`);
            window.location.href = redirectUrl;

        } else {
            console.error("[DEBUG - scriptindex.js] iniciarNovaRodada() não retornou um ID válido.");
            showCustomAlert('Erro ao iniciar o quiz: ID da rodada inválido. Por favor, tente novamente.');
        }

    } catch (error) {
        console.error("[DEBUG - scriptindex.js] Erro ao iniciar nova rodada:", error);
        showCustomAlert('Erro ao iniciar o quiz. Por favor, tente novamente.');
    }
};


document.addEventListener('DOMContentLoaded', () => {
    const introMessageDiv = document.getElementById('introMessage');
    const playQuizButton = document.getElementById('playQuizButton');
    const mainContentDiv = document.getElementById('mainContent'); 


    const typingTextElement = document.getElementById('typing-text');
    const cursorElement = document.getElementById('cursor');
    const textToType = "Teste seus conhecimentos em Informática!"; 
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100; 


    const heading1Element = document.getElementById('heading1');
    const textToTypeHeading = "Desenvoloped by Allan, Nathan, Diogo, Samuel e Pedro | ByCode "; 
    let charIndexHeading = 0;
    let isDeletingHeading = false;
    let typingSpeedHeading = 120; 

    function typeEffect() {
        if (!typingTextElement) return;

        const currentText = textToType.substring(0, charIndex);
        typingTextElement.textContent = currentText;

        if (!isDeleting && charIndex < textToType.length) {
            charIndex++;
            typingSpeed = 100;
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            typingSpeed = 50;
        }

        if (charIndex === textToType.length && !isDeleting) {
            typingSpeed = 2000; 
            isDeleting = true;
        } else if (charIndex === 0 && isDeleting) {
            typingSpeed = 500; 
            isDeleting = false;
        }

        setTimeout(typeEffect, typingSpeed);
    }


    function typeEffectHeading() {
        if (!heading1Element) return;

        const currentTextHeading = textToTypeHeading.substring(0, charIndexHeading);
        heading1Element.textContent = currentTextHeading;

        if (!isDeletingHeading && charIndexHeading < textToTypeHeading.length) {
            charIndexHeading++;
            typingSpeedHeading = 120;
        } else if (isDeletingHeading && charIndexHeading > 0) {
            charIndexHeading--;
            typingSpeedHeading = 60;
        }

        if (charIndexHeading === textToTypeHeading.length && !isDeletingHeading) {
            typingSpeedHeading = 2500;
            isDeletingHeading = true;
        } else if (charIndexHeading === 0 && isDeletingHeading) {
            typingSpeedHeading = 700; 
            isDeletingHeading = false;
        }

        setTimeout(typeEffectHeading, typingSpeedHeading);
    }


    function startTypingEffects() {
        if (typingTextElement && cursorElement) {
            typeEffect();
            setInterval(() => {
                cursorElement.style.visibility = (cursorElement.style.visibility === 'hidden' ? 'visible' : 'hidden');
            }, 500);
        }
        if (heading1Element) {
            typeEffectHeading();
        }
    }


    if (introMessageDiv && mainContentDiv) {
        console.log("Exibindo mensagem introdutória (sempre).");
        introMessageDiv.classList.remove('hidden'); 
        mainContentDiv.classList.add('hidden');   

        
    } else {
        console.error("Erro: Um ou mais elementos principais (introMessageDiv, mainContentDiv) não foram encontrados no DOM!");
        startTypingEffects();
    }


    if (playQuizButton && introMessageDiv && mainContentDiv) {
        playQuizButton.addEventListener('click', () => {
            console.log("Botão 'JOGAR QUIZ!' da mensagem introdutória clicado.");
            introMessageDiv.classList.add('hidden');    
            mainContentDiv.classList.remove('hidden'); 
            startTypingEffects(); 
        });
    } else if (mainContentDiv && !(introMessageDiv && playQuizButton)) {
        mainContentDiv.classList.remove('hidden');
        startTypingEffects();
    }


    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navbarMenu = document.getElementById('navbarMenu');

    if (hamburgerMenu && navbarMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navbarMenu.classList.toggle('active'); 
        });
    } else {
        console.warn("Elementos do menu hambúrguer não encontrados (hamburgerMenu ou navbarMenu).");
    }
});

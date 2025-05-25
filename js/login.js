import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"; 

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username'); 
    const passwordInput = document.getElementById('password');
    const messageDisplay = document.getElementById('message');
    const togglePassword = document.getElementById('togglePassword');
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
    function setupPasswordToggle(toggleBtn, passwordField) {
        if (toggleBtn && passwordField) {
            const eyeIcon = toggleBtn.querySelector('i'); 
            if (eyeIcon) {
                toggleBtn.addEventListener('click', () => {
                    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordField.setAttribute('type', type);
                    eyeIcon.classList.toggle('fa-eye');
                    eyeIcon.classList.toggle('fa-eye-slash');
                });
            }
        }
    }
    setupPasswordToggle(togglePassword, passwordInput);

    onAuthStateChanged(auth, (user) => {
        const redirectUrl = localStorage.getItem('redirectAfterLogin');

        if (user) {
            console.log("Usuário logado:", user.email, "UID:", user.uid);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUserEmail', user.email); 
            localStorage.setItem('loggedInUserUID', user.uid); 

            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUserEmail');
            localStorage.removeItem('loggedInUserUID');
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            messageDisplay.textContent = 'Login bem-sucedido!';
            messageDisplay.className = 'message success';
            setTimeout(() => {
            }, 1000);

        } catch (error) {
            console.error("Erro ao fazer login:", error.code, error.message);
            let errorMessage = 'Usuário ou senha incorretos.';

            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Usuário ou senha incorretos.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Formato de e-mail inválido.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Acesso temporariamente bloqueado devido a muitas tentativas. Tente novamente mais tarde.';
                    break;
                default:
                    errorMessage = 'Erro no login: ' + error.message;
            }
            messageDisplay.textContent = errorMessage;
            messageDisplay.className = 'message error';
            passwordInput.value = '';
        }
    });
});
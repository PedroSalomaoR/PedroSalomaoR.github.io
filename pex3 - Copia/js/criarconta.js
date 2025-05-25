import { auth } from './firebase-init.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const createAccountForm = document.getElementById('createAccountForm');
    const newUsernameInput = document.getElementById('newUsername');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const createMessageDisplay = document.getElementById('createMessage');
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
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
    setupPasswordToggle(toggleNewPassword, newPasswordInput);
    setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);

    createAccountForm.addEventListener('submit', async (event) => { 
        event.preventDefault(); 

        const email = newUsernameInput.value.trim(); 
        const password = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        createMessageDisplay.textContent = '';
        createMessageDisplay.className = 'message';
        if (password.length < 6) { 
            createMessageDisplay.textContent = 'A senha deve ter pelo menos 6 caracteres.';
            createMessageDisplay.className = 'message error'; 
            return;
        }
        if (password !== confirmPassword) {
            createMessageDisplay.textContent = 'As senhas não coincidem.';
            createMessageDisplay.className = 'message error'; 
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            createMessageDisplay.textContent = 'Conta criada com sucesso! Redirecionando...';
            createMessageDisplay.className = 'message success';

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUserEmail', user.email); 
            localStorage.setItem('loggedInUserUID', user.uid);

            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            setTimeout(() => {
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1500);

        } catch (error) {
            console.error("Erro ao criar conta:", error.code, error.message);
            let errorMessage = 'Ocorreu um erro ao criar a conta.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este e-mail já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Formato de e-mail inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'A senha é muito fraca. Escolha uma mais forte.';
                    break;
                default:
                    errorMessage = 'Erro ao criar conta: ' + error.message;
            }
            createMessageDisplay.textContent = errorMessage;
            createMessageDisplay.className = 'message error'; 
        }
    });
});

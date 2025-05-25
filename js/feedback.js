import { db } from './firebase-init.js';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserEmail = localStorage.getItem('loggedInUserEmail'); 
    const loggedInUserUID = localStorage.getItem('loggedInUserUID');
    const customAlertModal = document.getElementById('customAlertModal');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertCloseButton = document.getElementById('customAlertCloseButton');
    const customConfirmModal = document.getElementById('customConfirmModal');
    const customConfirmMessage = document.getElementById('customConfirmMessage');
    const customConfirmYesButton = document.getElementById('customConfirmYesButton'); 
    const customConfirmNoButton = document.getElementById('customConfirmNoButton');

    function showCustomAlert(message, callback = null) {
        if (customAlertModal && customAlertMessage && customAlertCloseButton) {
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
    function showCustomConfirm(message) {
        return new Promise((resolve) => {
            if (customConfirmModal && customConfirmMessage && customConfirmYesButton && customConfirmNoButton) {
                customConfirmMessage.textContent = message;
                customConfirmModal.classList.remove('hidden');

                const onYesClick = () => {
                    hideCustomConfirm();
                    resolve(true);
                    customConfirmYesButton.removeEventListener('click', onYesClick);
                    customConfirmNoButton.removeEventListener('click', onNoClick);
                };

                const onNoClick = () => {
                    hideCustomConfirm();
                    resolve(false);
                    customConfirmYesButton.removeEventListener('click', onYesClick);
                    customConfirmNoButton.removeEventListener('click', onNoClick);
                };
                customConfirmYesButton.addEventListener('click', onYesClick);
                customConfirmNoButton.addEventListener('click', onNoClick);
            } else {
                console.error("Elementos do customConfirmModal não encontrados. Exibindo confirm padrão.");
                resolve(confirm(message)); 
            }
        });
    }
    function hideCustomConfirm() {
        if (customConfirmModal) {
            customConfirmModal.classList.add('hidden'); 
        }
    }
    if (customAlertCloseButton) {
        customAlertCloseButton.addEventListener('click', hideCustomAlert);
    }
    if (customConfirmYesButton && customConfirmNoButton) {
    }


    if (!loggedInUserEmail || !loggedInUserUID) {
        showCustomAlert('Você precisa estar logado para postar ou ver feedbacks!', () => {
            localStorage.setItem('redirectAfterLogin', 'feedback.html'); 
            window.location.href = 'login.html'; 
        });
        return;
    }
    const displayUsername = loggedInUserEmail.includes('@') ? loggedInUserEmail.split('@')[0] : loggedInUserEmail;
    const feedbackForm = document.getElementById('feedbackForm');
    const userNameInput = document.getElementById('userName');
    const ratingInput = document.getElementById('rating');
    const commentInput = document.getElementById('comment');
    const starRatingDiv = document.getElementById('starRating');
    const feedbackStatusParagraph = document.getElementById('feedbackStatus');
    const feedbackListDiv = document.getElementById('feedbackList');
    const backToHomeButton = document.getElementById('backToHomeButton');
    const formspreeFeedbackForm = document.getElementById('formspreeFeedbackForm');
    const formFeedbackUserName = document.getElementById('formFeedbackUserName');
    const formFeedbackRating = document.getElementById('formFeedbackRating');
    const formFeedbackComment = document.getElementById('formFeedbackComment');
    const formFeedbackSubject = document.getElementById('formFeedbackSubject');

    let currentRating = 0; 
    userNameInput.value = displayUsername;
    userNameInput.readOnly = true;
    userNameInput.style.backgroundColor = '#e9e9e9';

    async function deleteFeedbackFromFirebase(docId, feedbackUserName, feedbackTimestamp) {
        const confirmed = await showCustomConfirm(`Tem certeza que deseja excluir SEU feedback (postado por ${feedbackUserName} em ${new Date(parseInt(feedbackTimestamp)).toLocaleString()})?`);

        if (!confirmed) {
            return; 
        }

        feedbackStatusParagraph.textContent = 'Excluindo feedback...';
        feedbackStatusParagraph.className = 'message';

        try {
            await deleteDoc(doc(db, 'feedbacks', docId));
            feedbackStatusParagraph.textContent = 'Feedback removido com sucesso!';
            feedbackStatusParagraph.className = 'message success';
            renderFeedbacks();
        } catch (error) {
            console.error("Erro ao excluir feedback do Firebase:", error);
            feedbackStatusParagraph.textContent = 'Erro ao remover feedback. Tente novamente.';
            feedbackStatusParagraph.className = 'message error';
        }
    }

    starRatingDiv.addEventListener('click', (event) => {
        const clickedStar = event.target.closest('.fa-star');
        if (clickedStar) {
            const value = parseInt(clickedStar.dataset.value);
            currentRating = value;
            ratingInput.value = value;
            updateStarDisplay(value);
        }
    });

    starRatingDiv.addEventListener('mouseover', (event) => {
        const hoveredStar = event.target.closest('.fa-star');
        if (hoveredStar) {
            const value = parseInt(hoveredStar.dataset.value);
            updateStarDisplay(value);
        }
    });

    starRatingDiv.addEventListener('mouseout', () => {
        updateStarDisplay(currentRating);
    });

    function updateStarDisplay(value) {
        const stars = starRatingDiv.querySelectorAll('.fa-star');
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    async function renderFeedbacks() {
        feedbackListDiv.innerHTML = '<p>Carregando feedbacks...</p>';
        let feedbacks = [];

        try {
            const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                feedbacks.push({ id: doc.id, ...doc.data() });
            });

            if (feedbacks.length === 0) {
                feedbackListDiv.innerHTML = '<p>Nenhum feedback recebido ainda.</p>';
                return;
            }

            feedbackListDiv.innerHTML = '';

            feedbacks.forEach(feedback => {
                const feedbackItem = document.createElement('div');
                feedbackItem.classList.add('feedback-item');
                const displayDate = feedback.timestamp ? new Date(parseInt(feedback.timestamp)).toLocaleString() : 'Data Desconhecida';

                let deleteButtonHTML = '';
                if (feedback.userId === loggedInUserUID) {
                    deleteButtonHTML = `
                        <button class="delete-feedback-btn botao"
                                data-doc-id="${feedback.id}"
                                data-username="${feedback.userName}"
                                data-timestamp="${feedback.timestamp}">Excluir</button>
                    `;
                }

                feedbackItem.innerHTML = `
                    <h3>${feedback.userName}</h3>
                    <p class="feedback-rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</p>
                    <p>${feedback.comment}</p>
                    <p class="feedback-date">${displayDate}</p>
                    ${deleteButtonHTML}
                `;
                feedbackListDiv.appendChild(feedbackItem);
            });
            document.querySelectorAll('.delete-feedback-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const docIdToDelete = event.target.dataset.docId;
                    const feedbackUserName = event.target.dataset.username;
                    const feedbackTimestamp = event.target.dataset.timestamp;
                    deleteFeedbackFromFirebase(docIdToDelete, feedbackUserName, feedbackTimestamp);
                });
            });

        } catch (error) {
            console.error("Erro ao carregar feedbacks do Firebase:", error);
            feedbackListDiv.innerHTML = '<p class="error-message">Erro ao carregar feedbacks. Tente novamente mais tarde.</p>';
        }
    }

    renderFeedbacks(); 
    feedbackForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const rating = parseInt(ratingInput.value);
        const comment = commentInput.value.trim();

        if (rating === 0) {
            showCustomAlert('Por favor, dê uma avaliação em estrelas.');
            feedbackStatusParagraph.className = 'message error'; 
            return;
        }
        if (!comment) {
            showCustomAlert('Por favor, escreva um comentário.');
            feedbackStatusParagraph.className = 'message error'; 
            return;
        }

        const feedbackData = {
            userName: displayUsername, 
            userEmail: loggedInUserEmail, 
            userId: loggedInUserUID, 
            rating: rating,
            comment: comment,
            timestamp: new Date().getTime()
        };

        feedbackStatusParagraph.textContent = 'Enviando feedback...';
        feedbackStatusParagraph.className = 'message';

        try {
            await addDoc(collection(db, 'feedbacks'), feedbackData);

            feedbackStatusParagraph.textContent = 'Feedback enviado com sucesso!';
            feedbackStatusParagraph.className = 'message success';
            if (formspreeFeedbackForm && formspreeFeedbackForm.action) {
                formFeedbackUserName.value = displayUsername;
                formFeedbackRating.value = rating;
                formFeedbackComment.value = comment;
                formFeedbackSubject.value = `Novo Feedback de: ${displayUsername} (${rating} estrelas) - ${new Date(feedbackData.timestamp).toLocaleString()}`;

                await fetch(formspreeFeedbackForm.action, {
                    method: 'POST',
                    body: new FormData(formspreeFeedbackForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                console.log("Feedback também enviado para Formspree (se configurado).");
            }

            renderFeedbacks();
            ratingInput.value = '0';
            commentInput.value = '';
            currentRating = 0;
            updateStarDisplay(0);

        } catch (error) {
            console.error('Erro ao enviar feedback para o Firebase:', error);
            feedbackStatusParagraph.textContent = 'Erro ao enviar feedback. Tente novamente.';
            feedbackStatusParagraph.className = 'message error';
        }
    });


    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
});
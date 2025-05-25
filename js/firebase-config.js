// Importa a função initializeApp do SDK do Firebase
// Usamos a URL do CDN para garantir que funcione com type="module" no HTML
// ATENÇÃO: Mude a versão do Firebase App para 11.6.1 para ser consistente
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

// Opcional: Se você for usar o Google Analytics para Firebase, importe getAnalytics
// ATENÇÃO: Mude a versão do Firebase Analytics para 11.6.1 se for usar
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";


// SUA ÚNICA CONFIGURAÇÃO DO FIREBASE AQUI
// Esta é a configuração REAL do seu projeto Firebase, copiada do console.
const firebaseConfig = {
    apiKey: "AIzaSyCgYi15RCzJG59KcdvlVYkaPUhrzGNfChM",
    authDomain: "meuquizapp-8a9c3.firebaseapp.com",
    projectId: "meuquizapp-8a9c3",
    storageBucket: "meuquizapp-8a9c3.firebasestorage.app",
    messagingSenderId: "207575510769",
    appId: "1:207575510769:web:adf65d81231562a9a9c350",
    // measurementId é para Analytics, se for usar. Se não, pode remover.
    measurementId: "G-ZP145PJ2VW"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporta apenas a instância do aplicativo Firebase (app).
// As instâncias de auth e db (Firestore) serão inicializadas e exportadas
// de 'firebase-init.js'. Funções como 'collection', 'addDoc' etc.
// devem ser importadas diretamente de seus respectivos módulos CDN
// nos arquivos onde são utilizadas.
export { app };

// Agora, 'app' (e 'analytics', se habilitado) está pronto para ser importado
// por outros arquivos JavaScript que precisam interagir com o Firebase.
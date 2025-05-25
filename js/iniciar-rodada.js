import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from './firebase-init.js';
import { auth } from './firebase-init.js';

export async function iniciarNovaRodada() {
    try {
        const currentUser = auth.currentUser; 
        if (!currentUser) {
            console.error("Erro: Nenhum usuário logado para iniciar uma nova rodada.");
            throw new Error("Usuário não autenticado.");
        }

        const roundsCollection = collection(db, "rounds");
        const docRef = await addDoc(roundsCollection, {
            startedAt: new Date(),
            status: "active",
            userId: currentUser.uid 
        });
        return docRef.id;
    } catch (error) {
        console.error("Erro ao criar nova rodada:", error);
        throw error;
    }
}
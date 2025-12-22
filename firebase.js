// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Cole seu firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyDj-c4uArNjAr7cSg396yfQR6xuyumh5_M",
  authDomain: "simuladosmedicina-6a01b.firebaseapp.com",
  projectId: "simuladosmedicina-6a01b",
  storageBucket: "simuladosmedicina-6a01b.firebasestorage.app",
  messagingSenderId: "577452734306",
  appId: "1:577452734306:web:5926d087a27a216a97de3b",
  measurementId: "G-F125W28J18"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Função para verificar revisão espaçada
export async function podeRevisar(email) {
  const userRef = doc(db, "usuarios", email);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, { ultimaRevisao: null });
    return true;
  }
  const ultima = userSnap.data().ultimaRevisao;
  if (!ultima) return true;

  const ultimaData = new Date(ultima);
  const hoje = new Date();
  const diffDias = (hoje - ultimaData) / (1000*60*60*24);
  return diffDias >= 7;
}

// Atualiza data da última revisão
export async function registrarRevisao(email) {
  const userRef = doc(db, "usuarios", email);
  await setDoc(userRef, { ultimaRevisao: new Date().toISOString() }, { merge: true });
}

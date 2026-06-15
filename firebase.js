// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

// ================= CONFIG FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDj-c4uArNjAr7cSg396yfQR6xuyumh5_M",
  authDomain: "simuladosmedicina-6a01b.firebaseapp.com",
  projectId: "simuladosmedicina-6a01b",
  storageBucket: "simuladosmedicina-6a01b.appspot.com",
  messagingSenderId: "577452734306",
  appId: "1:577452734306:web:5926d087a27a216a97de3b",
  measurementId: "G-F125W28J18"
};

// ================= INIT =================
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ================= LOGIN GOOGLE =================
// ✅ Não verifica autorização aqui — o login.html cuida disso.
// Apenas abre o popup e retorna o usuário autenticado.
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// ================= LOGIN GITHUB =================
export async function loginGitHub() {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// ================= REVISÃO ESPAÇADA (AUXILIAR) =================
export async function podeRevisar(email) {
  const ref = doc(db, "usuarios", email.toLowerCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) return true;

  const ultima = snap.data().ultimaRevisao;
  if (!ultima) return true;

  const diffDias = (new Date() - new Date(ultima)) / (1000 * 60 * 60 * 24);
  return diffDias >= 7;
}

export async function registrarRevisao(email) {
  const ref = doc(db, "usuarios", email.toLowerCase());
  await setDoc(ref, { ultimaRevisao: new Date().toISOString() }, { merge: true });
}

// ================= OBSERVADOR GLOBAL DE ROTA =================
// Protege páginas privadas. NÃO faz signOut — apenas redireciona
// se o usuário não estiver logado fora da página de login.
onAuthStateChanged(auth, (user) => {
  const isLoginPage = window.location.pathname.includes("login.html");

  if (!user && !isLoginPage) {
    window.location.href = "login.html";
  }

  // Se está logado e na página de login, o próprio login.html
  // cuida do redirecionamento correto via seu onAuthStateChanged.
});

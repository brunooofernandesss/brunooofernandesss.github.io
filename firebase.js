// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// ======================
// Configuração do Firebase
// ======================
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

// ======================
// Provedores de login
// ======================
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// ======================
// Funções de login
// ======================

// Login com Email e Senha
export async function loginEmail(email, senha) {
  return await signInWithEmailAndPassword(auth, email, senha);
}

// Criar usuário com Email e Senha
export async function criarUsuario(email, senha) {
  return await createUserWithEmailAndPassword(auth, email, senha);
}

// Login com Google
export async function loginGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

// Login com GitHub
export async function loginGitHub() {
  return await signInWithPopup(auth, githubProvider);
}

// Logout
export async function logout() {
  return await signOut(auth);
}

// ======================
// Controle de última revisão
// ======================

// Verifica se usuário pode revisar (7 dias)
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
  const diffDias = (hoje - ultimaData) / (1000 * 60 * 60 * 24);

  return diffDias >= 7;
}

// Atualiza data da última revisão
export async function registrarRevisao(email) {
  const userRef = doc(db, "usuarios", email);
  await setDoc(userRef, { ultimaRevisao: new Date().toISOString() }, { merge: true });
}

// ======================
// Observador de login
// ======================
export function observarUsuario(callback) {
  onAuthStateChanged(auth, callback);
}

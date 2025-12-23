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

// ================= LOGIN GOOGLE =================
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const autorizado = await verificarAutorizacao(result.user);

  if (!autorizado) {
    await signOut(auth);
    throw new Error("Usuário não autorizado");
  }

  return result.user;
}

// ================= LOGIN GITHUB =================
export async function loginGitHub() {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const autorizado = await verificarAutorizacao(result.user);

  if (!autorizado) {
    await signOut(auth);
    throw new Error("Usuário não autorizado");
  }

  return result.user;
}

// ================= REGISTRO / AUTORIZAÇÃO =================
async function verificarAutorizacao(user) {
  const email = user.email.toLowerCase();
  const userRef = doc(db, "usuarios", email);
  const snap = await getDoc(userRef);

  // ❌ não cadastrado
  if (!snap.exists()) {
    return false;
  }

  // ❌ cadastrado mas não autorizado
  if (snap.data().autorizado !== true) {
    return false;
  }

  // ✅ autorizado → atualiza dados
  await setDoc(
    userRef,
    {
      nome: user.displayName || "",
      email: email,
      ultimoLogin: new Date().toISOString()
    },
    { merge: true }
  );

  return true;
}

// ================= REVISÃO ESPAÇADA =================
export async function podeRevisar(email) {
  const ref = doc(db, "usuarios", email.toLowerCase());
  const snap = await getDoc(ref);

  if (!snap.exists()) return true;

  const ultima = snap.data().ultimaRevisao;
  if (!ultima) return true;

  const diffDias =
    (new Date() - new Date(ultima)) / (1000 * 60 * 60 * 24);

  // regra atual: revisar a cada 7 dias
  return diffDias >= 7;
}

export async function registrarRevisao(email) {
  const ref = doc(db, "usuarios", email.toLowerCase());
  await setDoc(
    ref,
    { ultimaRevisao: new Date().toISOString() },
    { merge: true }
  );
}

// ================= OBSERVADOR GLOBAL =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const email = user.email.toLowerCase();
  const ref = doc(db, "usuarios", email);
  const snap = await getDoc(ref);

  if (!snap.exists() || snap.data().autorizado !== true) {
    await signOut(auth);
    window.location.href = "login.html";
  }
});

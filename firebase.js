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
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const autorizado = await verificarAutorizacao(result.user);

  if (!autorizado) {
    await signOut(auth);
    throw new Error("Usuário não cadastrado ou não autorizado no sistema.");
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
    throw new Error("Usuário não cadastrado ou não autorizado no sistema.");
  }
  return result.user;
}

// ================= REGISTRO / AUTORIZAÇÃO =================
async function verificarAutorizacao(user) {
  const email = user.email.toLowerCase();
  const userRef = doc(db, "usuarios", email);
  const snap = await getDoc(userRef);

  // ❌ Não cadastrado ou não autorizado
  if (!snap.exists() || snap.data().autorizado !== true) {
    return false;
  }

  // ✅ Autorizado → atualiza metadados de acesso
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
// Esta função protege suas páginas privadas, mas ignora a página de login
onAuthStateChanged(auth, async (user) => {
  const isLoginPage = window.location.pathname.includes("login.html");

  if (!user) {
    // Se não está logado e não está no login, manda para lá
    if (!isLoginPage) {
      window.location.href = "login.html";
    }
    return;
  }

  // Se o usuário está logado, verificamos a permissão no Firestore
  const email = user.email.toLowerCase();
  const ref = doc(db, "usuarios", email);
  
  try {
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().autorizado !== true) {
      console.warn("Usuário logado mas sem autorização no banco.");
      await signOut(auth);
      if (!isLoginPage) window.location.href = "login.html";
    } else {
      // Se está logado, autorizado e na página de login, manda para o index
      if (isLoginPage) {
        window.location.href = "index.html";
      }
    }
  } catch (error) {
    console.error("Erro ao verificar autorização global:", error);
  }
});

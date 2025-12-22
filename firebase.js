// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDj-c4uArNjAr7cSg396yfQR6xuyumh5_M",
  authDomain: "simuladosmedicina-6a01b.firebaseapp.com",
  projectId: "simuladosmedicina-6a01b",
  storageBucket: "simuladosmedicina-6a01b.appspot.com",
  messagingSenderId: "577452734306",
  appId: "1:577452734306:web:5926d087a27a216a97de3b",
  measurementId: "G-F125W28J18"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Função para login Google
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await registrarUsuario(result.user);
  return result.user;
}

// Função para login GitHub
export async function loginGitHub() {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await registrarUsuario(result.user);
  return result.user;
}

// Registrar usuário no Firestore
async function registrarUsuario(user) {
  const userRef = doc(db, "usuarios", user.email);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      nome: user.displayName || "",
      email: user.email,
      ultimaRevisao: null
    });
  }
}

// Revisão espaçada
export async function podeRevisar(email) {
  const userRef = doc(db, "usuarios", email);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, { ultimaRevisao: null });
    return true;
  }
  const ultima = userSnap.data().ultimaRevisao;
  if (!ultima) return true;
  const diffDias = (new Date() - new Date(ultima)) / (1000*60*60*24);
  return diffDias >= 7;
}

export async function registrarRevisao(email) {
  const userRef = doc(db, "usuarios", email);
  await setDoc(userRef, { ultimaRevisao: new Date().toISOString() }, { merge: true });
}

// Observa estado do usuário
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Usuário logado:", user.email);
  } else {
    console.log("Nenhum usuário logado");
  }
});

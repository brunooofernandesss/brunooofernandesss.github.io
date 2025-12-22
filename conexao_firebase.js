// conexao_firebase.js - Registro obrigatório com nome do Google

// Importa Firebase
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>');

window.addEventListener('load', function() {
    // Configuração Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDj-c4uArNjAr7cSg396yfQR6xuyumh5_M",
        authDomain: "simuladosmedicina-6a01b.firebaseapp.com",
        projectId: "simuladosmedicina-6a01b",
        storageBucket: "simuladosmedicina-6a01b.firebasestorage.app",
        messagingSenderId: "577452734306",
        appId: "1:577452734306:web:5926d087a27a216a97de3b",
        measurementId: "G-F125W28J18"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();
    const analytics = firebase.analytics();
    const auth = firebase.auth();

    // PROTEÇÃO DE PÁGINA
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "login.html";
        }
    });

    // Botão de verificar respostas
    const btnVerificar = document.getElementById("verifyAnswersBtn");
    if (btnVerificar) {
        console.log("🔥 Firebase pronto para capturar nota.");

        btnVerificar.addEventListener("click", function() {
            setTimeout(() => {
                calcularESalvarAutomatico(db, auth);
            }, 1000); 
        });
    }
});

// Calcula a nota e salva automaticamente
function calcularESalvarAutomatico(db, auth) {
    let totalQuestoes = document.querySelectorAll('.card').length || document.querySelectorAll('.question').length;

    let textoResultado = document.body.innerText.match(/acertou (\d+) de (\d+)/i) || 
                         document.body.innerText.match(/Score: (\d+)\/(\d+)/i);

    let acertos = 0;

    if (textoResultado) {
        acertos = parseInt(textoResultado[1]);
        if (!totalQuestoes) totalQuestoes = parseInt(textoResultado[2]);
    } else {
        alert("❌ Não foi possível ler a nota automaticamente.");
        return;
    }

    if (totalQuestoes > 0) {
        salvarNoBanco(db, auth, acertos, totalQuestoes);
    }
}

// Salva a nota obrigatoriamente usando o nome do usuário logado
function salvarNoBanco(db, auth, acertos, total) {
    const user = auth.currentUser;
    if (!user) {
        alert("❌ Usuário não logado. Não foi possível salvar a nota.");
        return;
    }

    const nome = user.displayName || user.email; // Nome do Google ou email se não houver
    db.collection("resultados_alunos").add({
        aluno: nome,
        nota: acertos,
        total: total,
        porcentagem: ((acertos/total)*100).toFixed(0) + "%",
        simulado: document.title,
        data: new Date().toLocaleString("pt-BR")
    }).then(() => alert(`✅ Nota salva automaticamente para ${nome}!`));
}

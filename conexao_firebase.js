// conexao_firebase.js - Versão Inteligente com Proteção

// Importa Firebase (compat)
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>');

window.addEventListener('load', function() {
    // 1. CONFIGURAÇÃO (Suas Chaves)
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
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    const analytics = firebase.analytics();

    // 🔐 Proteção da Página
    auth.onAuthStateChanged(user => {
        if (!user) {
            // Não está logado → redireciona para login
            window.location.href = "login.html";
        }
    });

    // 2. O ESPIÃO DE BOTÃO 🕵️‍♂️
    const btnVerificar = document.getElementById("verifyAnswersBtn");

    if (btnVerificar) {
        console.log("🔥 Firebase pronto para capturar nota.");
        btnVerificar.addEventListener("click", function() {
            setTimeout(() => {
                calcularESalvarAutomatico(db);
            }, 1000); 
        });
    }
});

// =================== FUNÇÕES AUXILIARES ===================
function calcularESalvarAutomatico(db) {
    let totalQuestoes = document.querySelectorAll('.card').length || document.querySelectorAll('.question').length;
    
    let textoResultado = document.body.innerText.match(/acertou (\d+) de (\d+)/i) || 
                         document.body.innerText.match(/Score: (\d+)\/(\d+)/i);

    let acertos = 0;

    if (textoResultado) {
        acertos = parseInt(textoResultado[1]);
        if (!totalQuestoes) totalQuestoes = parseInt(textoResultado[2]);
    } else {
        const inputNota = prompt("O sistema não leu a nota automática.\nQuantas questões você acertou?");
        if(inputNota) acertos = parseInt(inputNota);
        else return;
    }

    if (totalQuestoes > 0) {
        salvarNoBanco(db, acertos, totalQuestoes);
    }
}

function salvarNoBanco(db, acertos, total) {
    const nome = prompt("📝 Registro de Simulados\nDigite seu Nome ou Matrícula:");
    if (!nome) return;

    db.collection("resultados_alunos").add({
        aluno: nome,
        nota: acertos,
        total: total,
        porcentagem: ((acertos/total)*100).toFixed(0) + "%",
        simulado: document.title,
        data: new Date().toLocaleString("pt-BR")
    }).then(() => alert("✅ Nota Salva com Sucesso!"));
}

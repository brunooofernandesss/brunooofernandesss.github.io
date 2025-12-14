// conexao_firebase.js
// Esse arquivo conecta qualquer página do seu site ao banco de dados do Google

// Importa as ferramentas do Google
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>');

window.addEventListener('load', function() {
    // 1. SUAS CHAVES (Já configuradas)
    const firebaseConfig = {
        apiKey: "AIzaSyDj-c4uArNjAr7cSg396yfQR6xuyumh5_M",
        authDomain: "simuladosmedicina-6a01b.firebaseapp.com",
        projectId: "simuladosmedicina-6a01b",
        storageBucket: "simuladosmedicina-6a01b.firebasestorage.app",
        messagingSenderId: "577452734306",
        appId: "1:577452734306:web:5926d087a27a216a97de3b",
        measurementId: "G-F125W28J18"
    };

    // 2. INICIALIZA (Só se ainda não estiver rodando)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.firestore();
    window.analytics = firebase.analytics();
    console.log("🔥 Firebase conectado com sucesso!");
});

// 3. FUNÇÃO PARA SALVAR A NOTA (Pode ser chamada de qualquer simulado)
window.salvarNotaNoGoogle = function(acertos, total) {
    // Pergunta o nome do aluno
    const nome = prompt("📝 Simulado finalizado!\nDigite seu Nome ou Matrícula para registrar a nota:");

    if (nome) {
        const simuladoNome = document.title || "Simulado Sem Nome";
        
        window.db.collection("resultados_alunos").add({
            aluno: nome,
            nota: acertos,
            total_questoes: total,
            porcentagem: ((acertos/total)*100).toFixed(1) + "%",
            data: new Date().toLocaleString("pt-BR"),
            simulado: simuladoNome
        })
        .then(() => {
            alert("✅ Nota salva! O prof. Bruno já recebeu seu resultado.");
        })
        .catch((erro) => {
            console.error("Erro no Firebase:", erro);
            alert("Houve um erro ao salvar. Tente novamente.");
        });
    }
};


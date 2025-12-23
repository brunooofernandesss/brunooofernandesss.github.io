import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// 1. INJEÇÃO DE ESTILOS (CSS)
const style = document.createElement('style');
style.textContent = `
    :root {
        --bg-body: #f3f4f6;
        --bg-white: #ffffff;
        --border-color: #e5e7eb;
        --text-primary: #111827;
        --text-secondary: #6b7280;
        --brand-color: #0f172a;
        --accent-color: #2563eb;
        --hover-bg: #f9fafb;
    }
    
    /* Reseta e define fonte */
    body {
        font-family: 'Inter', -apple-system, sans-serif;
        background-color: var(--bg-body);
        color: var(--text-primary);
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    /* Navbar Fixa */
    .navbar {
        background-color: var(--bg-white);
        border-bottom: 1px solid var(--border-color);
        padding: 0 32px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 1000;
        flex-shrink: 0;
    }

    .navbar-brand {
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--brand-color);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .navbar-brand i { color: var(--accent-color); }

    .user-profile {
        display: flex; align-items: center; gap: 12px;
        padding: 6px 12px; border-radius: 6px;
        transition: background 0.2s; cursor: default;
    }
    .user-profile:hover { background-color: var(--hover-bg); }

    .user-avatar {
        width: 32px; height: 32px;
        background-color: var(--brand-color);
        color: white; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.875rem; font-weight: 600;
    }

    .user-info-text { display: flex; flex-direction: column; line-height: 1.2; text-align: right; }
    .user-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .user-meta { font-size: 0.75rem; color: var(--text-secondary); }

    /* Container do Quiz */
    .quiz-container {
        max-width: 800px;
        width: 100%;
        margin: 40px auto;
        padding: 0 20px;
    }

    /* Tags de Navegação */
    .nav-tags {
        display: flex; gap: 8px; margin-bottom: 24px; justify-content: center;
    }
    .nav-tag {
        display: inline-flex; align-items: center; padding: 6px 12px;
        background-color: transparent; border-radius: 4px;
        color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;
        text-decoration: none; transition: all 0.15s ease;
    }
    .nav-tag:hover { color: var(--text-primary); background-color: rgba(0, 0, 0, 0.05); }
    .nav-tag.active { background-color: #e5e7eb; color: var(--brand-color); font-weight: 600; cursor: default; }

    /* Ajustes dos Cards e Botões existentes */
    .card, .card-bloco {
        background-color: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    h1 { color: var(--brand-color); font-size: 1.8rem; margin-bottom: 30px; text-align: center; }
    
    .submit-btn {
        background-color: var(--accent-color);
        border-radius: 6px;
        font-weight: 600;
    }
    .submit-btn:hover { background-color: #1d4ed8; }

    /* Mobile */
    @media (max-width: 640px) {
        .navbar { padding: 0 16px; }
        .user-info-text { display: none; }
    }
`;
document.head.appendChild(style);

// 2. INJEÇÃO DO FONTAWESOME (Se não existir)
if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fa);
}

// 3. INJEÇÃO DA NAVBAR E TAGS
document.addEventListener("DOMContentLoaded", () => {
    // A) Inserir Navbar no topo do Body
    const navbarHTML = `
        <nav class="navbar">
            <a href="index.html" class="navbar-brand">
                <i class="fas fa-graduation-cap"></i> Medicina UNIP
            </a>
            <div class="user-profile">
                <div class="user-info-text">
                    <span class="user-name" id="displayUser">Carregando...</span>
                    <div class="user-meta"><span id="displayIp">...</span></div>
                </div>
                <div class="user-avatar" id="userAvatar"><i class="fas fa-user"></i></div>
            </div>
        </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // B) Inserir Tags dentro do Quiz Container (antes do título)
    const quizContainer = document.querySelector('.quiz-container');
    const title = quizContainer ? quizContainer.querySelector('h1') : null;
    
    if (quizContainer) {
        const tagsHTML = `
            <div class="nav-tags">
                <a href="index.html" class="nav-tag active">Simulados</a>
                <a href="resumos.html" class="nav-tag">Resumos</a>
                <a href="planner.html" class="nav-tag">Planner</a>
            </div>
        `;
        // Insere antes do título H1, ou no começo do container se não achar H1
        if (title) {
            title.insertAdjacentHTML('beforebegin', tagsHTML);
        } else {
            quizContainer.insertAdjacentHTML('afterbegin', tagsHTML);
        }
    }
});

// 4. LÓGICA DE AUTENTICAÇÃO E IP
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const displayName = user.displayName || "Estudante";
        const email = user.email || "";
        
        // Nome
        const nameEl = document.getElementById('displayUser');
        if (nameEl) nameEl.textContent = displayName;
        
        // Avatar
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) {
            const initials = displayName.split(" ").map((n)=>n[0]).join("").substring(0,2).toUpperCase();
            avatarEl.textContent = initials;
        }

        // IP
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            const ipEl = document.getElementById('displayIp');
            if(ipEl) {
                ipEl.textContent = data.ip;
                ipEl.title = `Logado como: ${email}`;
            }
        } catch {
            const ipEl = document.getElementById('displayIp');
            if(ipEl) ipEl.style.display = 'none';
        }
    } else {
        // Opcional: Descomente se quiser forçar login em todos os simulados
        // alert("Faça login para acessar.");
        // window.location.href = "login.html";
    }
});

import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// --- 1. CSS ---
const style = document.createElement('style');
style.textContent = `
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-height: 100vh !important;
        background-color: #f3f4f6 !important;
        font-family: 'Inter', -apple-system, sans-serif !important;
        overflow-x: hidden !important;
        position: relative !important;
    }

    .navbar {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 64px !important;
        background-color: #ffffff !important;
        border-bottom: 1px solid #e5e7eb !important;
        padding: 0 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        z-index: 1000 !important;
        box-sizing: border-box !important;
    }

    body {
        padding-top: 84px !important;
    }

    .navbar-brand {
        font-weight: 700; font-size: 1.125rem; color: #0f172a;
        text-decoration: none; display: flex; align-items: center; gap: 10px;
    }
    .navbar-brand i { color: #2563eb; }

    .user-profile {
        display: flex; align-items: center; gap: 12px;
        padding: 6px 12px; border-radius: 6px; cursor: default;
        transition: background 0.2s;
    }
    .user-profile:hover { background-color: #f9fafb; }

    .user-avatar {
        width: 32px; height: 32px; background-color: #0f172a; color: white;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 0.875rem; font-weight: 600;
    }

    .user-info-text { display: flex; flex-direction: column; line-height: 1.2; text-align: right; }
    .user-name { font-size: 0.875rem; font-weight: 600; color: #111827; }
    .user-meta { font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 6px; }

    /* Badge de plano */
    .badge-plano {
        display: inline-flex; align-items: center; gap: 3px;
        padding: 2px 7px; border-radius: 20px;
        font-size: 0.7rem; font-weight: 700; letter-spacing: 0.02em;
    }
    .badge-premium {
        background: #dbeafe; color: #1d4ed8;
        border: 1px solid #bfdbfe;
    }
    .badge-gratuito {
        background: #fef9c3; color: #92400e;
        border: 1px solid #fde68a;
    }

    .quiz-container {
        max-width: 800px; width: 100%;
        margin: 0 auto 40px auto !important;
        padding: 0 20px !important;
        box-sizing: border-box !important;
    }

    .nav-tags {
        display: flex; gap: 8px; margin-bottom: 24px; justify-content: center; flex-wrap: wrap;
    }
    .nav-tag {
        display: inline-flex; align-items: center; padding: 6px 12px;
        background-color: transparent; border-radius: 4px;
        color: #6b7280; font-size: 0.85rem; font-weight: 500;
        text-decoration: none; transition: all 0.15s ease;
    }
    .nav-tag:hover { color: #111827; background-color: rgba(0, 0, 0, 0.05); }
    .nav-tag.active { background-color: #e5e7eb; color: #0f172a; font-weight: 600; cursor: default; }

    .card, .card-bloco {
        background-color: #ffffff; border: 1px solid #e5e7eb;
        border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    h1 { color: #0f172a; font-size: 1.8rem; margin-bottom: 30px; text-align: center; font-family: 'Inter', sans-serif; }

    .submit-btn { background-color: #2563eb; border-radius: 6px; font-weight: 600; }
    .submit-btn:hover { background-color: #1d4ed8; }

    @media (max-width: 640px) {
        .navbar { padding: 0 16px !important; }
        .user-info-text { display: none; }
    }

    /* DROPDOWN MENU */
    .user-dropdown {
        position: absolute; top: 60px; right: 20px;
        background: white; border: 1px solid #e5e7eb;
        border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        width: 180px; display: none; flex-direction: column;
        z-index: 2000; overflow: hidden;
    }
    .user-dropdown.active { display: flex; }

    .dropdown-item {
        padding: 12px 16px; font-size: 0.9rem;
        cursor: pointer; display: flex; align-items: center; gap: 8px;
        font-weight: 500; transition: background 0.2s; text-decoration: none;
    }
    .dropdown-item-logout { color: #d44c47; }
    .dropdown-item-logout:hover { background-color: #fef2f2; }
    .dropdown-item-premium { color: #1d4ed8; }
    .dropdown-item-premium:hover { background-color: #eff6ff; }
`;
document.head.appendChild(style);

// 2. FONTAWESOME
if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fa);
}

// 3. INJEÇÃO DA NAVBAR
document.addEventListener("DOMContentLoaded", () => {
    const navbarHTML = `
        <nav class="navbar">
            <a href="index.html" class="navbar-brand">
                <i class="fas fa-graduation-cap"></i> Medicina UNIP
            </a>
            <div class="user-profile" id="btnProfileTrigger" style="cursor: pointer;">
                <div class="user-info-text">
                    <span class="user-name" id="displayUser">Carregando...</span>
                    <div class="user-meta">
                        <span id="displayIp">...</span>
                        <span id="badgePlano"></span>
                    </div>
                </div>
                <div class="user-avatar" id="userAvatar"><i class="fas fa-user"></i></div>
            </div>

            <div class="user-dropdown" id="userDropdownMenu">
                <div class="dropdown-item dropdown-item-premium" id="btnAssinarPremium" style="display:none;">
                    <i class="fas fa-star"></i> Assinar Premium
                </div>
                <div class="dropdown-item dropdown-item-logout" id="btnAppLogout">
                    <i class="fas fa-sign-out-alt"></i> Sair do Sistema
                </div>
            </div>
        </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Dropdown toggle
    const btnProfile = document.getElementById('btnProfileTrigger');
    const dropdown = document.getElementById('userDropdownMenu');
    const btnLogout = document.getElementById('btnAppLogout');
    const btnPremium = document.getElementById('btnAssinarPremium');

    if (btnProfile && dropdown) {
        btnProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!btnProfile.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                alert("Erro ao tentar sair.");
            }
        });
    }

    if (btnPremium) {
        btnPremium.addEventListener('click', () => {
            window.location.href = "login.html";
        });
    }
});

// 4. AUTH + PLANO
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const displayName = user.displayName || "Estudante";
    const email = user.email || "";

    // Nome e avatar
    const nameEl = document.getElementById('displayUser');
    if (nameEl) nameEl.textContent = displayName;

    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
        const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        avatarEl.textContent = initials;
    }

    // IP
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        const ipEl = document.getElementById('displayIp');
        if (ipEl) {
            ipEl.textContent = `IP: ${data.ip}`;
            ipEl.title = `Logado como: ${email}`;
        }
    } catch {
        const ipEl = document.getElementById('displayIp');
        if (ipEl) ipEl.style.display = 'none';
    }

    // Plano (lê do Firestore)
    try {
        const userRef = doc(db, "usuarios", email.toLowerCase());
        const snap = await getDoc(userRef);
        const plano = snap.exists() ? (snap.data().plano || "gratuito") : "gratuito";

        const badgeEl = document.getElementById('badgePlano');
        const btnPremium = document.getElementById('btnAssinarPremium');

        if (plano === "premium") {
            if (badgeEl) badgeEl.innerHTML = `<span class="badge-plano badge-premium"><i class="fas fa-star" style="font-size:0.6rem;"></i> Premium</span>`;
            if (btnPremium) btnPremium.style.display = 'none';
        } else {
            if (badgeEl) badgeEl.innerHTML = `<span class="badge-plano badge-gratuito"><i class="fas fa-lock" style="font-size:0.6rem;"></i> Gratuito</span>`;
            if (btnPremium) btnPremium.style.display = 'flex';
        }
    } catch (e) {
        console.warn("Não foi possível ler o plano do usuário:", e.message);
    }
});

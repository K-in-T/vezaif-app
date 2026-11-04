import { auth } from '../firebase-config.js';
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = window.firebaseModules;

import { state, loadUserData, showNotification } from './state.js';
import { renderDashboard, processDailyCheck } from './dashboard.js';
import { renderCurriculumTab } from './mufredat.js';
import { renderJournalTab } from './gunluk.js';
import { renderAwards } from './kazanimlar.js';
import { renderSupervisor } from './sorumlu.js';
import { renderSettings } from './ayarlar.js';

// Şık Giriş / Kayıt Ekranı Tasarımı
function renderLoginScreen() {
    return `
        <div class="flex items-center justify-center w-full h-screen bg-stone-100 p-4">
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-md">
                <div class="text-center space-y-2">
                    <div class="inline-block p-4 bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 rounded-2xl text-emerald-600 text-3xl mb-2 shadow-sm">🏠</div>
                    <h2 class="text-2xl font-black text-slate-800">Medrese İhtisas Programı</h2>
                    <p class="text-xs text-slate-500 font-medium">Devam etmek için e-posta ve şifrenizi girin</p>
                </div>
                <form onsubmit="handleAuth(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">E-posta Adresi</label>
                        <input type="email" id="login-email" required class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 font-medium">
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">Şifre</label>
                        <input type="password" id="login-password" required class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 font-medium">
                    </div>
                    <button type="submit" class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-2xl text-sm transition-all shadow-md active:translate-y-0.5">Giriş Yap / Kayıt Ol</button>
                </form>
            </div>
        </div>
    `;
}

export function render() {
    const mainElement = document.querySelector('main');
    const currentScrollTop = mainElement ? mainElement.scrollTop : 0;
    const app = document.getElementById('app');
    
    // Oturum açılmamışsa şık giriş ekranını basar
    if (!state.user) {
        app.innerHTML = renderLoginScreen();
        return;
    }

    const isSorumlu = state.role === 'sorumlu';

    app.innerHTML = `
        <div class="w-full h-screen flex flex-col bg-stone-100 text-slate-800 overflow-hidden font-sans">
            <main class="w-full flex-1 overflow-y-auto p-4 md:p-8 pb-28 pt-6 bg-stone-100">
                ${state.activeTab === 'dashboard' ? renderDashboard() : ''}
                ${state.activeTab === 'kazanimlar' ? renderAwards() : ''}
                ${state.activeTab === 'müfredat' ? renderCurriculumTab() : ''}
                ${state.activeTab === 'sorumlu-paneli' && isSorumlu ? renderSupervisor() : ''}
                ${state.activeTab === 'günlük' ? renderJournalTab() : ''}
                ${state.activeTab === 'ayarlar' ? renderSettings() : ''}
            </main>

            <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-stone-200 shadow-lg px-4 py-2">
                <div class="max-w-md mx-auto flex justify-around items-center">
                    <button onclick="switchTab('dashboard')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl ${state.activeTab === 'dashboard' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}">
                        <span class="text-xl">🌳</span><span class="text-[10px] uppercase font-black">Bitki</span>
                    </button>
                    <button onclick="switchTab('kazanimlar')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl ${state.activeTab === 'kazanimlar' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}">
                        <span class="text-xl">🏆</span><span class="text-[10px] uppercase font-black">Geçmiş</span>
                    </button>
                    <button onclick="switchTab('günlük')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl ${state.activeTab === 'günlük' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}">
                        <span class="text-xl">✒️</span><span class="text-[10px] uppercase font-black">Günlük</span>
                    </button>
                    <button onclick="switchTab('ayarlar')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl ${state.activeTab === 'ayarlar' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}">
                        <span class="text-xl">⚙️</span><span class="text-[10px] uppercase font-black">Ayarlar</span>
                    </button>
                </div>
            </nav>
        </div>
    `;

    const newMainElement = document.querySelector('main');
    if (newMainElement) newMainElement.scrollTop = currentScrollTop;
}

window.render = render;
window.switchTab = function(tab) { state.activeTab = tab; render(); };

// Giriş / Kayıt Ol butonunun tetiklediği fonksiyon
window.handleAuth = async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        showNotification("Giriş yapıldı!", "success");
    } catch (err) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await loadUserData(userCredential.user.uid);
            showNotification("Hesabınız oluşturuldu!", "success");
        } catch (createErr) {
            showNotification("Giriş yapılamadı. Bilgilerinizi kontrol edin.", "error");
        }
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = user;
        await loadUserData(user.uid);
        await processDailyCheck();
    } else {
        state.user = null;
    }
    render();
});
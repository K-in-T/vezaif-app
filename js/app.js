import { auth, db } from '../firebase-config.js';
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = window.firebaseModules;
const { doc, setDoc, getDoc } = window.firebaseModules; // Firestore doküman işlemleri için

import { state, loadUserData, showNotification } from './state.js';
import { renderDashboard, processDailyCheck } from './dashboard.js';
import { renderCurriculumTab } from './mufredat.js';
import { renderJournalTab } from './gunluk.js';
import { renderAwards } from './kazanimlar.js';
import { renderSupervisor } from './sorumlu.js';
import { renderSettings } from './ayarlar.js';
import { loadStudents } from './state.js';

// Şık Giriş / Kayıt Ekranı Tasarımı (Ad Soyad Alanı Eklendi)
function renderLoginScreen() {
    return `
        <div class="flex items-center justify-center w-full h-screen bg-stone-100 p-4">
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-md">
                <div class="text-center space-y-2">
                    <div class="inline-block p-4 bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 rounded-2xl text-emerald-600 text-3xl mb-2 shadow-sm">🏠</div>
                    <h2 class="text-2xl font-black text-slate-800">Medrese İhtisas Programı</h2>
                    <p class="text-xs text-slate-500 font-medium">Devam etmek için bilgilerinizi girin</p>
                </div>
                <form onsubmit="handleAuth(event)" class="space-y-4">
                    <div id="name-field-container" class="hidden">
                        <label class="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">Ad Soyad</label>
                        <input type="text" id="login-name" placeholder="Örn: Ahmet Yılmaz" class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 font-medium">
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">E-posta Adresi</label>
                        <input type="email" id="login-email" required placeholder="ornek@mail.com" class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 font-medium">
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">Şifre</label>
                        <input type="password" id="login-password" required placeholder="••••••••" class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 font-medium">
                    </div>
                    <button type="submit" id="auth-submit-btn" class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-2xl text-sm transition-all shadow-md active:translate-y-0.5">Giriş Yap</button>
                    
                    <div class="text-center pt-2">
                        <button type="button" onclick="toggleAuthMode()" class="text-xs font-bold text-emerald-700 hover:underline">
                            Hesabınız yok mu? <span id="auth-mode-text" class="underline font-black">Kayıt Olun</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Giriş ve Kayıt modları arasında geçiş için yardımcı değişken
window.isRegisterMode = false;
window.toggleAuthMode = function() {
    window.isRegisterMode = !window.isRegisterMode;
    const nameContainer = document.getElementById('name-field-container');
    const submitBtn = document.getElementById('auth-submit-btn');
    const modeText = document.getElementById('auth-mode-text');
    const nameInput = document.getElementById('login-name');

    if (window.isRegisterMode) {
        nameContainer.classList.remove('hidden');
        nameInput.required = true;
        submitBtn.textContent = "Kayıt Ol";
        modeText.textContent = "Giriş Yap";
    } else {
        nameContainer.classList.add('hidden');
        nameInput.required = false;
        submitBtn.textContent = "Giriş Yap";
        modeText.textContent = "Kayıt Ol";
    }
};

export function render() {
    const mainElement = document.querySelector('main');
    const currentScrollTop = mainElement ? mainElement.scrollTop : 0;
    const app = document.getElementById('app');
    
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
                        <span class="text-xl">✅</span><span class="text-[10px] uppercase font-black">Kazanımlar</span>
                    </button>
                    <button onclick="switchTab('günlük')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl ${state.activeTab === 'günlük' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}">
                        <span class="text-xl">✒️</span><span class="text-[10px] uppercase font-black">Günlük</span>
                    </button>
                    ${isSorumlu ? `
                    <button onclick="switchTab('sorumlu-paneli')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl ${state.activeTab === 'sorumlu-paneli' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}">
                        <span class="text-xl">🛡️</span><span class="text-[10px] uppercase font-black">Sorumlu</span>
                    </button>` : ''}
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
window.switchTab = async function(tab) { 
    state.activeTab = tab; 
    if (tab === 'sorumlu-paneli' && state.role === 'sorumlu') {
        await loadStudents();
    }
    render(); 
};

// E-posta adresinin geçerli olup olmadığını (örn: kullanici@domain.com) denetleyen regex fonksiyonu
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

window.handleAuth = async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const nameInput = document.getElementById('login-name');
    const fullName = nameInput ? nameInput.value.trim() : '';

    // E-posta format denetimi (sadece @ yetmez, nokta ve uzantı da olmalı)
    if (!isValidEmail(email)) {
        showNotification("Lütfen geçerli bir e-posta adresi girin (örn: isim@site.com)", "error");
        return;
    }

    try {
        if (window.isRegisterMode) {
            if (!fullName) {
                showNotification("Lütfen ad ve soyadınızı girin.", "error");
                return;
            }
            // Kayıt Olma İşlemi
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;
            
            // Kullanıcı dokümanına ad soyad bilgisini de kaydedelim
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                fullName: fullName,
                role: "normal",
                treePhase: "tohum1",
                streak: 0,
                tasks: [],
                completedHistory: []
            }, { merge: true });

            await loadUserData(user.uid);
            showNotification("Hesabınız başarıyla oluşturuldu!", "success");
        } else {
            // Giriş Yapma İşlemi
            await signInWithEmailAndPassword(auth, email, pass);
            showNotification("Giriş yapıldı!", "success");
        }
    } catch (err) {
        console.error("Auth hatası:", err);
        showNotification("İşlem başarısız. Bilgilerinizi veya şifrenizi kontrol edin.", "error");
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
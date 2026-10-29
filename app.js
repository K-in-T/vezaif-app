import { auth, db } from './firebase-config.js';
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = window.firebaseModules;
const { doc, getDoc, setDoc, updateDoc, collection, getDocs } = window.firebaseModules;

// --- UYGULAMA DURUMU (STATE) ---
let state = {
    user: null,
    role: 'normal',
    activeTab: 'dashboard',
    treeState: 'growing', 
    streak: 0,
    consecutiveFailures: 0,
    lastCheckDate: null,
    authStep: 'login',
    tempAuthData: { email: '', pass: '' },
    tasks: [], // Kullanıcının seçtiği aktif günlük vazifeler
    curriculum: [], // Global müfredat havuzu
    students: []
};

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function getDaysBetween(dateString1, dateString2) {
    if (!dateString1 || !dateString2) return 0;
    const d1 = new Date(dateString1);
    const d2 = new Date(dateString2);
    return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

function showNotification(message, type = 'error') {
    const existingBanner = document.getElementById('auth-notification');
    if (existingBanner) existingBanner.remove();

    const banner = document.createElement('div');
    banner.id = 'auth-notification';
    banner.className = `fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl text-sm font-medium shadow-2xl transition-all duration-300 border ${
        type === 'error' ? 'bg-red-950/90 text-red-200 border-red-800' : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
    }`;
    banner.innerText = message;
    
    document.body.appendChild(banner);
    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
    }, 3500);
}

function getTurkishAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password': return 'Geçersiz şifre veya e-posta adresi.';
        case 'auth/user-not-found': return 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.';
        case 'auth/email-already-in-use': return 'Bu e-posta adresi zaten kullanımda.';
        case 'auth/weak-password': return 'Şifre çok zayıf (en az 6 karakter olmalıdır).';
        default: return 'Bir hata oluştu. Lütfen tekrar deneyiniz.';
    }
}

async function processDailyCheck() {
    const today = getTodayString();
    if (state.lastCheckDate && state.lastCheckDate !== today) {
        const daysPassed = getDaysBetween(state.lastCheckDate, today);
        const mainTasks = state.tasks.filter(t => !t.isExtra);
        const allMainCompleted = mainTasks.every(t => t.completed);

        if (allMainCompleted) {
            state.streak += 1;
            state.consecutiveFailures = 0;
            state.treeState = 'growing';
        } else {
            state.consecutiveFailures += daysPassed;
            if (state.consecutiveFailures >= 3) {
                state.treeState = 'seed';
                state.streak = 0;
            } else {
                state.treeState = 'wilting';
            }
        }
        state.tasks = state.tasks.map(t => ({ ...t, completed: false }));
        state.lastCheckDate = today;
        await saveUserData();
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = user;
        await loadUserData(user.uid);
    } else {
        state.user = null;
        state.role = 'normal';
        state.students = [];
    }
    render();
});

async function loadUserData(uid) {
    try {
        const userDocRef = doc(db, "users", uid);
        const userSnap = await getDoc(userDocRef);
        const today = getTodayString();
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            state.role = data.role || 'normal';
            state.streak = data.streak || 0;
            state.consecutiveFailures = data.consecutiveFailures || 0;
            state.treeState = data.treeState || 'growing';
            state.lastCheckDate = data.lastCheckDate || today;
            if (data.tasks) state.tasks = data.tasks;
            await processDailyCheck();
        } else {
            state.role = 'normal';
            state.lastCheckDate = today;
            await setDoc(userDocRef, {
                email: state.user.email,
                role: 'normal',
                streak: 0,
                consecutiveFailures: 0,
                treeState: 'growing',
                lastCheckDate: today,
                tasks: state.tasks
            });
        }

        if (state.role === 'sorumlu') {
            await loadStudents();
        } else {
            state.students = [];
        }
    } catch (error) {
        console.error("Veri yüklenirken hata:", error);
    }
}

async function loadStudents() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        state.students = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.role === 'normal') {
                state.students.push({ id: docSnap.id, ...data });
            }
        });
    } catch (error) {
        console.error("Talebe listesi yüklenirken hata:", error);
    }
}

async function saveUserData() {
    if (!state.user) return;
    try {
        const userDocRef = doc(db, "users", state.user.uid);
        await updateDoc(userDocRef, {
            streak: state.streak,
            consecutiveFailures: state.consecutiveFailures,
            treeState: state.treeState,
            lastCheckDate: state.lastCheckDate,
            tasks: state.tasks
        });
    } catch (error) {
        console.error("Veri kaydedilirken hata:", error);
    }
}

// Navigation Bar ve Ana İçerik Alanı Render Fonksiyonu
// --- RENDER MİMARİSİ ---
function render() {
    // 1. İşlem yapılmadan önceki kaydırma (scroll) konumunu kaydet
    const mainElement = document.querySelector('main');
    const currentScrollTop = mainElement ? mainElement.scrollTop : 0;

    const app = document.getElementById('app');
    
    if (!state.user) {
        app.innerHTML = renderLoginScreen();
        return;
    }

    app.innerHTML = `
        <div class="w-full h-full flex flex-col bg-stone-900 text-stone-100 overflow-hidden">
            <!-- ÜST SABİT SEKME ÇUBUĞU -->
            <header class="w-full bg-stone-950 border-b border-stone-800 px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-lg z-30">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">🌿</div>
                    <div>
                        <h1 class="font-bold text-base tracking-wide text-emerald-100">Medrese Gelişim</h1>
                        <p class="text-xs text-stone-400">İlim & İstikrar Takibi</p>
                    </div>
                </div>

                <nav class="flex items-center gap-1.5 overflow-x-auto py-1">
                    <button onclick="switchTab('dashboard')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${state.activeTab === 'dashboard' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 shadow-sm' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}">
                        <span>🌲</span> Ana Ekran
                    </button>
                    <button onclick="switchTab('istatistik')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${state.activeTab === 'istatistik' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 shadow-sm' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}">
                        <span>📊</span> İstatistikler
                    </button>
                    <button onclick="switchTab('kazanimlar')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${state.activeTab === 'kazanimlar' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 shadow-sm' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}">
                        <span>🏆</span> Kazanımlar
                    </button>
                    <button onclick="switchTab('müfredat')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${state.activeTab === 'müfredat' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 shadow-sm' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}">
    <span>📖</span> Müfredat
</button>
                    ${state.role === 'sorumlu' ? `
                        <button onclick="switchTab('sorumlu-paneli')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${state.activeTab === 'sorumlu-paneli' ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50 shadow-sm' : 'text-amber-500/80 hover:bg-stone-900 hover:text-amber-400'}">
                            <span>👤</span> Sorumlu Paneli
                        </button>
                    ` : ''}
                    <button onclick="switchTab('ayarlar')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${state.activeTab === 'ayarlar' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 shadow-sm' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}">
                        <span>⚙️</span> Ayarlar
                    </button>
                </nav>

                <div class="text-xs text-stone-400 hidden xl:block truncate max-w-[200px]">
                    Oturum: <strong class="text-stone-200">${state.user.email}</strong>
                </div>
            </header>

            <!-- ANA İÇERİK ALANI -->
            <main class="w-full flex-1 overflow-y-auto p-6 md:p-8 bg-stone-900">
                ${state.activeTab === 'dashboard' ? renderDashboard() : ''}
                ${state.activeTab === 'istatistik' ? renderStats() : ''}
                ${state.activeTab === 'kazanimlar' ? renderAwards() : ''}
                ${state.activeTab === 'müfredat' ? renderCurriculumTab() : ''}
                ${state.activeTab === 'sorumlu-paneli' && state.role === 'sorumlu' ? renderSupervisor() : ''}
                ${state.activeTab === 'ayarlar' ? renderSettings() : ''}
            </main>
        </div>
    `;

    // 2. Render tamamlandıktan sonra kaydırma konumunu eski yerine getir
    const newMainElement = document.querySelector('main');
    if (newMainElement) {
        newMainElement.scrollTop = currentScrollTop;
    }
}

function renderLoginScreen() {
    if (state.authStep === 'login') {
        return `
            <div class="flex items-center justify-center w-full h-full bg-stone-900">
                <div class="bg-stone-950 border border-stone-800 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-xl">
                    <div class="text-center space-y-2">
                        <div class="inline-block p-3 bg-emerald-950 border border-emerald-800 rounded-2xl text-emerald-400 text-2xl mb-2">🌿</div>
                        <h2 class="text-2xl font-bold text-stone-100">Medrese Gelişim</h2>
                        <p class="text-xs text-stone-400">Devam etmek için e-posta ve şifrenizi girin</p>
                    </div>
                    <form onsubmit="handleAuth(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-medium text-stone-400 mb-1">E-posta Adresi</label>
                            <input type="email" id="login-email" required class="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-200 text-sm focus:outline-none focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-stone-400 mb-1">Şifre</label>
                            <input type="password" id="login-password" required class="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-200 text-sm focus:outline-none focus:border-emerald-500">
                        </div>
                        <button type="submit" class="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl text-sm transition-colors shadow-lg">Giriş Yap / Devam Et</button>
                    </form>
                </div>
            </div>
        `;
    }

    return `
        <div class="flex items-center justify-center w-full h-full bg-stone-900">
            <div class="bg-stone-950 border border-stone-800 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-xl">
                <div class="text-center space-y-2">
                    <div class="inline-block p-3 bg-emerald-950 border border-emerald-800 rounded-2xl text-emerald-400 text-2xl mb-2">✨</div>
                    <h2 class="text-2xl font-bold text-stone-100">Aramıza Hoş Geldiniz!</h2>
                    <p class="text-xs text-stone-400">Sorumlunuzun sizi tanıyabilmesi için lütfen adınızı ve soyadınızı belirtin.</p>
                </div>
                <form onsubmit="completeRegistration(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-stone-400 mb-1">Ad Soyad</label>
                        <input type="text" id="register-name" required placeholder="Örn: Ahmet Yasin" class="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-200 text-sm focus:outline-none focus:border-emerald-500" autofocus>
                    </div>
                    <button type="submit" class="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl text-sm transition-colors shadow-lg">Kayıt İşlemini Tamamla</button>
                    <button type="button" onclick="cancelRegistration()" class="w-full text-xs text-stone-500 hover:text-stone-300 py-1">Geri Dön</button>
                </form>
            </div>
        </div>
    `;
}

function renderDashboard() {
    const completedTasksCount = state.tasks.filter(t => t.completed).length;
    const totalTasksCount = state.tasks.length;

    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <header class="flex justify-between items-center bg-stone-950 p-6 rounded-2xl border border-stone-800">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">Günlük Vazifeler ve Hayat Ağacı</h2>
                    <p class="text-sm text-stone-400">Müfredattan seçtiğiniz vazifeleri tamamlayın. Gece 00:00'da otomatik kontrol edilir.</p>
                </div>
                <div class="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 px-4 py-2 rounded-xl text-emerald-300">
                    <span class="text-sm font-semibold">🔥 Seri (Streak): ${state.streak} Gün</span>
                </div>
            </header>

            <!-- AĞAÇ DURUM ALANI -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
                <div class="p-6 rounded-full text-6xl mb-4 transition-all duration-500 ${
                    state.treeState === 'growing' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 shadow-lg shadow-emerald-950' :
                    state.treeState === 'wilting' ? 'bg-amber-950/80 text-amber-400 border border-amber-700/50' : 
                    'bg-stone-900 text-stone-600 border border-stone-800'
                }">
                    ${state.treeState === 'growing' ? '🌳' : state.treeState === 'wilting' ? '🍂' : '🌰'}
                </div>
                <h3 class="text-xl font-bold mb-1">
                    ${state.treeState === 'growing' ? '🌳 Ağacınız Sağlıklı ve Büyüyor!' : state.treeState === 'wilting' ? '🍂 Dikkat! Vazifeler aksadı, ağaç yaprak döküyor.' : '🌰 Üst üste 3 gün vazifeler yapılmadığı için ağaç tohuma döndü.'}
                </h3>
            </div>

            <!-- VAZİFELER LİSTESİ VE MÜFREDATA YÖNLENDİRME -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold">📋 Günün Vazifeleri</h3>
                    <button onclick="switchTab('müfredat')" class="text-xs px-3 py-1.5 bg-emerald-900/40 text-emerald-300 border border-emerald-800 rounded-xl hover:bg-emerald-900/60 transition-colors">
                        📖 Müfredata Git & Vazife Seç
                    </button>
                </div>

                <!-- VAZİFELER LİSTESİ (Checkbox ile) -->
                <div class="space-y-3">
                    ${state.tasks.length > 0 ? state.tasks.map(task => `
                        <div class="p-4 rounded-2xl bg-stone-900 border ${task.completed ? 'border-emerald-900/50 bg-emerald-950/10' : 'border-stone-800'} flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})" class="w-5 h-5 accent-emerald-600 rounded cursor-pointer">
                                <div>
                                    <h4 class="font-semibold text-stone-100 ${task.completed ? 'line-through text-stone-400' : ''}">${task.title}</h4>
                                    <span class="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400">${task.category}</span>
                                </div>
                            </div>
                            <!-- LİSTEDEN ÇIKARMA (SİLME) -->
                            <button onclick="deleteTask(${task.id})" class="text-stone-500 hover:text-red-400 text-xs px-2 py-1">🗑️ Kaldır</button>
                        </div>
                    `).join('') : `
                        <div class="text-center py-10 text-stone-500 space-y-3 border border-dashed border-stone-800 rounded-2xl">
                            <span class="text-3xl">📚</span>
                            <p class="text-sm font-medium">Günlük programınızda henüz vazife bulunmuyor.</p>
                            <p class="text-xs text-stone-600">Sorumlunuzun hazırladığı havuzdan derslerinizi seçmek için müfredat sekmesini kullanın.</p>
                            <button onclick="switchTab('müfredat')" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl text-sm transition-colors">
                                Müfredata Git
                            </button>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// --- İSTATİSTİKLER SEKMESİ (Kategori Bazlı İlerleme Çubukları) ---
// --- İSTATİSTİKLER SEKMESİ (Haftalık, Aylık ve Genel Analiz) ---
window.statsPeriod = window.statsPeriod || 'genel'; // 'haftalik', 'aylik', 'genel'

window.setStatsPeriod = function(period) {
    window.statsPeriod = period;
    render();
}

function renderStats() {
    const totalStreak = state.streak || 0;
    const completedTasksCount = state.tasks.filter(t => t.completed).length;
    const totalTasksCount = state.tasks.length;
    const todayCompletion = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Alan bazlı kategoriler
    const categories = ["Kur'an", "Osmanlıca", "Ezber", "Mütalaa", "Özel"];
    const categoryStats = categories.map(cat => {
        const catTasks = state.tasks.filter(t => t.category === cat);
        const catTotal = catTasks.length;
        const catCompleted = catTasks.filter(t => t.completed).length;
        const percent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
        return { category: cat, total: catTotal, completed: catCompleted, percent };
    }).filter(c => c.total > 0);

    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <!-- Başlık ve Zaman Dilimi Filtresi -->
            <div class="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">Gelişim & Performans Analizi</h2>
                    <p class="text-sm text-stone-400">Zamansal filtreler ile istikrarınızı ve ders bazlı ilerlemenizi takip edin.</p>
                </div>
                
                <!-- Zaman Dilimi Butonları -->
                <div class="flex items-center gap-1 bg-stone-900 p-1.5 rounded-xl border border-stone-800">
                    <button onclick="setStatsPeriod('haftalik')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${window.statsPeriod === 'haftalik' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-stone-400 hover:text-stone-200'}">
                        🗓️ Haftalık
                    </button>
                    <button onclick="setStatsPeriod('aylik')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${window.statsPeriod === 'aylik' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-stone-400 hover:text-stone-200'}">
                        📅 Aylık
                    </button>
                    <button onclick="setStatsPeriod('genel')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${window.statsPeriod === 'genel' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-stone-400 hover:text-stone-200'}">
                        📜 Genel (Tüm Zamanlar)
                    </button>
                </div>
            </div>

            <!-- ZAMAN DİLİMİNE GÖRE DİNAMİK ÖZET KARTLARI -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-stone-950 border border-stone-800 p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                        <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">
                            ${window.statsPeriod === 'haftalik' ? 'Haftalık Seri' : window.statsPeriod === 'aylik' ? 'Aylık İstikrar' : 'Aktif Seri (Streak)'}
                        </p>
                        <h3 class="text-4xl font-extrabold text-emerald-400 mt-2">${totalStreak} <span class="text-lg font-normal text-stone-400">Gün</span></h3>
                    </div>
                    <div class="mt-4 pt-4 border-t border-stone-900 text-xs text-stone-500">
                        🔥 Kesintisiz devam edilen gün sayısı
                    </div>
                </div>

                <div class="bg-stone-950 border border-stone-800 p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                        <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">
                            ${window.statsPeriod === 'haftalik' ? 'Haftalık Ortalama' : window.statsPeriod === 'aylik' ? 'Aylık Ortalama' : 'Bugünkü Başarı'}
                        </p>
                        <h3 class="text-4xl font-extrabold text-amber-400 mt-2">%${todayCompletion}</h3>
                    </div>
                    <div class="mt-4 pt-4 border-t border-stone-900 text-xs text-stone-500">
                        ✅ ${completedTasksCount} / ${totalTasksCount} Vazife Tamamlandı
                    </div>
                </div>

                <div class="bg-stone-950 border border-stone-800 p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                        <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">İlim Ağacı Durumu</p>
                        <h3 class="text-2xl font-bold text-sky-400 mt-2">
                            ${state.treeState === 'growing' ? '🌳 Sağlıklı Büyüyor' : state.treeState === 'wilting' ? '🍂 Solgun' : '🌰 Tohum'}
                        </h3>
                    </div>
                    <div class="mt-4 pt-4 border-t border-stone-900 text-xs text-stone-500">
                        🌱 Genel vazife tamamlama disiplini
                    </div>
                </div>
            </div>

            <!-- ALAN BAZLI GENEL GRAFİK VE İLERLEME -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-8 space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold text-stone-200">
                        📖 ${window.statsPeriod === 'haftalik' ? 'Haftalık' : window.statsPeriod === 'aylik' ? 'Aylık' : 'Tüm Zamanlar'} Ders Bazlı İlerleme
                    </h3>
                    <span class="text-xs text-stone-500 font-mono">
                        ${window.statsPeriod === 'genel' ? 'Başlangıçtan İtibaren' : 'Seçili Periyot'}
                    </span>
                </div>
                
                <div class="space-y-5">
                    ${categoryStats.length > 0 ? categoryStats.map(stat => `
                        <div class="space-y-2">
                            <div class="flex justify-between items-center text-sm">
                                <span class="font-semibold text-stone-300 flex items-center gap-2">
                                    ${stat.category === "Kur'an" ? '📖' : stat.category === 'Ezber' ? '🎙️' : stat.category === 'Osmanlıca' ? '📜' : '📚'} 
                                    ${stat.category} Alanı
                                </span>
                                <span class="text-xs text-stone-400">
                                    <strong class="text-emerald-400">%${stat.percent}</strong> (${stat.completed}/${stat.total} Vazife)
                                </span>
                            </div>
                            <div class="w-full bg-stone-900 h-3 rounded-full overflow-hidden p-0.5 border border-stone-800">
                                <div class="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500" style="width: ${stat.percent}%"></div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-6 text-stone-500 text-xs">
                            Henüz tanımlanmış ve tamamlanmış bir vazife kategorisi bulunmuyor.
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// --- KAZANIMLAR SEKMESİ (Tarih Damgalı Bitirilen Vazifeler) ---
function renderAwards() {
    const todayStr = state.lastCheckDate || new Date().toISOString().split('T')[0];
    const completedTasks = state.tasks.filter(t => t.completed);

    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <!-- Başlık -->
            <div class="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">Kazanımlar ve Tamamlananlar</h2>
                    <p class="text-sm text-stone-400">Tamamlanan vazifelerinizi ve hangi tarihte bitirildiklerini inceleyin.</p>
                </div>
                <div class="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-400 text-xl">
                    🏆
                </div>
            </div>

            <!-- Rozetler Özet -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center space-y-1">
                    <span class="text-3xl">🌱</span>
                    <p class="text-xs font-bold text-stone-300">İlim Talebesi</p>
                    <p class="text-[10px] text-stone-500">İlk Adım</p>
                </div>
                <div class="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center space-y-1 ${state.streak >= 7 ? 'opacity-100' : 'opacity-40'}">
                    <span class="text-3xl">🔥</span>
                    <p class="text-xs font-bold text-stone-300">7 Gün İstikrar</p>
                    <p class="text-[10px] text-stone-500">${state.streak >= 7 ? 'Kazanıldı!' : 'Kilitli'}</p>
                </div>
                <div class="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center space-y-1 ${state.streak >= 30 ? 'opacity-100' : 'opacity-40'}">
                    <span class="text-3xl">🌳</span>
                    <p class="text-xs font-bold text-stone-300">Müstakim Ağaç</p>
                    <p class="text-[10px] text-stone-500">${state.streak >= 30 ? 'Kazanıldı!' : 'Kilitli'}</p>
                </div>
                <div class="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center space-y-1 ${completedTasks.length > 0 ? 'opacity-100' : 'opacity-40'}">
                    <span class="text-3xl">📜</span>
                    <p class="text-xs font-bold text-stone-300">Vazife Mimarı</p>
                    <p class="text-[10px] text-stone-500">${completedTasks.length > 0 ? 'Kazanıldı!' : 'Kilitli'}</p>
                </div>
            </div>

            <!-- TARİHLİ BİTİRİLEN VAZİFELER LİSTESİ -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <h3 class="text-lg font-bold text-stone-200">📅 Tamamlanan Vazifeler Geçmişi</h3>

                ${completedTasks.length > 0 ? `
                    <div class="space-y-3">
                        ${completedTasks.map(t => `
                            <div class="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="text-emerald-400 text-lg">✅</span>
                                    <div>
                                        <p class="text-sm font-semibold text-stone-200">${t.title}</p>
                                        <p class="text-xs text-stone-500">Alan: ${t.category}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="px-3 py-1 bg-stone-950 text-emerald-400 border border-stone-800 rounded-xl text-xs font-mono">
                                        🗓️ ${todayStr}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-8 text-stone-500 space-y-2">
                        <span class="text-3xl">⏳</span>
                        <p class="text-sm">Henüz bugün tamamlanan bir vazife bulunmuyor.</p>
                        <p class="text-xs text-stone-600">Vazifelerinizi tamamladıkça tarih damgasıyla burada listelenecektir.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderSupervisor() {
    return `
        <div class="max-w-4xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-amber-400">Sorumlu İdare Paneli (Talebeler)</h2>
            <div class="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-stone-800 text-xs text-stone-400 bg-stone-900/50">
                            <th class="p-4">Talebe Adı</th>
                            <th class="p-4">E-posta</th>
                            <th class="p-4">Seri</th>
                            <th class="p-4">Ağaç Durumu</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-800 text-sm">
                        ${state.students.map(s => `
                            <tr>
                                <td class="p-4 font-medium text-stone-200">${s.name || 'İsimsiz'}</td>
                                <td class="p-4 text-stone-400 text-xs">${s.email}</td>
                                <td class="p-4 text-emerald-400">${s.streak} Gün</td>
                                <td class="p-4">
                                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${
                                        s.treeState === 'growing' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                        s.treeState === 'wilting' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                        'bg-stone-900 text-stone-500 border border-stone-800'
                                    }">
                                        ${s.treeState === 'growing' ? '🌳 Yeşil' : s.treeState === 'wilting' ? '🍂 Solgun' : '🌰 Tohum'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderSettings() {
    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <!-- Başlık -->
            <div class="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">Ayarlar ve Hesap</h2>
                    <p class="text-sm text-stone-400">Hesap bilgilerinizi yönetin ve oturumunuzu güvenle kapatın.</p>
                </div>
                <div class="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400 text-xl">
                    ⚙️
                </div>
            </div>

            <!-- Hesap Detayları -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-8 space-y-6">
                <h3 class="text-lg font-bold text-stone-200">Oturum Bilgileri</h3>
                <div class="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between">
                    <div>
                        <p class="text-xs text-stone-400">E-posta Adresi</p>
                        <p class="text-sm font-semibold text-stone-200 mt-0.5">${state.user.email}</p>
                    </div>
                    <span class="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-medium">Aktif Oturum</span>
                </div>

                <div class="pt-4 border-t border-stone-900 flex justify-between items-center">
                    <div>
                        <h4 class="text-sm font-bold text-red-400">Oturumu Kapat</h4>
                        <p class="text-xs text-stone-500 mt-0.5">Hesabınızdan güvenli bir şekilde çıkış yapın.</p>
                    </div>
                    <button onclick="handleLogout()" class="px-5 py-2.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 font-medium rounded-xl text-sm transition-colors shadow-lg">
                        🚪 Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- GLOBAL AKSİYONLAR ---

// --- VARSAYILAN MÜFREDATI YÜKLEME (Tek Seferlik Kurulum) ---
window.seedDefaultCurriculum = async function() {
    const defaultItems = [
        { title: "Kur'an-ı Kerim Cüz Okuması", category: "Kur'an", isGlobal: true },
        { title: "Ezber Dersi & Tekrarı (Hıfz)", category: "Ezber", isGlobal: true },
        { title: "Risale-i Nur Mütalaası", category: "Mütalaa", isGlobal: true },
        { title: "Osmanlıca Metin Okumaları", category: "Osmanlıca", isGlobal: true },
        { title: "Arapça Sarf / Nahiv Çalışması", category: "Mütalaa", isGlobal: true },
        { title: "Cevşen / Günlük Evrad Takibi", category: "Özel", isGlobal: true }
    ];

    try {
        for (const item of defaultItems) {
            await setDoc(doc(collection(db, "curriculum")), item);
        }
        showNotification("Varsayılan müfredat başarıyla yüklendi! 📚", "success");
        await loadCurriculum();
        render();
    } catch (err) {
        console.error("Müfredat tohumlama hatası:", err);
    }
}

// --- ÖZEL VAZİFE EKLEME (Sadece Ekleyen Görür) ---
window.addPersonalTask = async function(e) {
    e.preventDefault();
    const titleInput = document.getElementById('personal-task-title');
    const categorySelect = document.getElementById('personal-task-category');
    
    const title = titleInput.value.trim();
    const category = categorySelect.value;

    if (!title) return;

    // Doğrudan kullanıcının kendi günlük aktif görevlerine eklenir
    const newTask = {
        id: Date.now(),
        curriculumId: `custom_${Date.now()}`,
        title: title,
        category: category,
        completed: false,
        completedAt: null,
        isPersonal: true // Kişisel olduğunu belirtiyoruz
    };

    state.tasks.push(newTask);
    await saveUserData();
    showNotification("Özel vazifeniz programınıza eklendi! ✨", "success");
    render();
}

window.handleAuth = async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        showNotification("Başarıyla giriş yapıldı!", "success");
    } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
            state.tempAuthData = { email, pass };
            state.authStep = 'register_name';
            render();
        } else {
            showNotification(getTurkishAuthErrorMessage(err.code), "error");
        }
    }
}

window.completeRegistration = async function(e) {
    e.preventDefault();
    const nameInput = document.getElementById('register-name').value.trim();
    const { email, pass } = state.tempAuthData;
    const today = getTodayString();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;

        await setDoc(doc(db, "users", newUser.uid), {
            name: nameInput,
            email: email,
            role: 'normal',
            streak: 0,
            consecutiveFailures: 0,
            treeState: 'growing',
            lastCheckDate: today,
            tasks: state.tasks
        });

        state.authStep = 'login';
        state.tempAuthData = { email: '', pass: '' };
        showNotification("Hesabınız başarıyla oluşturuldu!", "success");
    } catch (createErr) {
        showNotification(getTurkishAuthErrorMessage(createErr.code), "error");
    }
}

window.cancelRegistration = function() {
    state.authStep = 'login';
    state.tempAuthData = { email: '', pass: '' };
    render();
}

window.handleLogout = async function() {
    if (confirm("Hesabınızdan çıkış yapmak istediğinize emin misiniz?")) {
        await signOut(auth);
        showNotification("Başarıyla çıkış yapıldı.", "success");
    }
}

window.switchTab = function(tab) { state.activeTab = tab; render(); }

// --- MÜFREDAT VE PROGRAM YÖNETİMİ ---
async function loadCurriculum() {
    try {
        const querySnapshot = await getDocs(collection(db, "curriculum"));
        state.curriculum = [];
        querySnapshot.forEach((docSnap) => {
            state.curriculum.push({ id: docSnap.id, ...docSnap.data() });
        });
    } catch (error) {
        console.error("Müfredat yüklenirken hata:", error);
    }
}

function renderCurriculumTab() {
    const isSorumlu = state.role === 'sorumlu';
    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <!-- BAŞLIK -->
            <div class="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">📖 Medrese Müfredat Havuzu</h2>
                    <p class="text-sm text-stone-400">Genel müfredattan ders seçebilir veya kendinize özel kişisel vazifeler oluşturabilirsiniz.</p>
                </div>
                ${isSorumlu && state.curriculum.length === 0 ? `
                    <button onclick="seedDefaultCurriculum()" class="px-3 py-2 bg-amber-950 text-amber-300 border border-amber-800 rounded-xl text-xs font-semibold">
                        ⚡ Örnek Müfredatı Yükle
                    </button>
                ` : ''}
            </div>

            <!-- SORUMLU İÇİN GENEL MÜFREDAT EKLEME -->
            ${isSorumlu ? `
                <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-4">
                    <h3 class="text-lg font-bold text-amber-400">➕ Genel Müfredat Vazifesi Ekle (Herkes Görür)</h3>
                    <form onsubmit="addCurriculumItem(event)" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="text" id="curr-title" placeholder="Genel Ders Adı..." required class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-emerald-500">
                        <select id="curr-category" class="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-sm text-stone-300 focus:outline-none focus:border-emerald-500">
                            <option value="Kur'an">📖 Kur'an</option>
                            <option value="Ezber">🎙️ Ezber</option>
                            <option value="Osmanlıca">📜 Osmanlıca</option>
                            <option value="Mütalaa">📚 Mütalaa</option>
                            <option value="Özel">✨ Özel</option>
                        </select>
                        <button type="submit" class="bg-emerald-700 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl text-sm transition-colors py-2.5">Müfredata Ekle</button>
                    </form>
                </div>
            ` : ''}

            <!-- GENEL MÜFREDAT LİSTESİ -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-4">
                <h3 class="text-lg font-bold text-stone-200">🏛️ Genel Medrese Müfredatı</h3>
                <div class="space-y-3">
                    ${state.curriculum.length > 0 ? state.curriculum.map(item => {
                        const isInMyTasks = state.tasks.some(t => t.curriculumId === item.id);
                        return `
                            <div class="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex justify-between items-center">
                                <div>
                                    <h4 class="font-semibold text-stone-200">${item.title}</h4>
                                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 mt-1 inline-block">${item.category}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    ${isSorumlu ? `
                                        <button onclick="deleteCurriculumItem('${item.id}')" class="px-3 py-1.5 bg-red-950/40 text-red-300 border border-red-800/50 rounded-xl text-xs">Sil</button>
                                    ` : `
                                        <button onclick="toggleTaskSelection('${item.id}', '${item.title}', '${item.category}')" class="px-4 py-2 rounded-xl text-xs font-semibold ${isInMyTasks ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}">
                                            ${isInMyTasks ? '✓ Programımda' : '+ Programıma Ekle'}
                                        </button>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div class="text-center py-6 text-stone-500 text-xs">
                            Henüz genel müfredat tanımlanmamış.
                        </div>
                    `}
                </div>
            </div>

            <!-- TALEBE İÇİN ÖZEL (KİŞİSEL) VAZİFE EKLEME FORMU -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-4">
                <div>
                    <h3 class="text-lg font-bold text-emerald-400">✨ Şahsi Ek Vazife Oluştur</h3>
                    <p class="text-xs text-stone-400">Burada eklediğiniz vazifeler sadece sizin kendi programınızda görünür.</p>
                </div>
                <form onsubmit="addPersonalTask(event)" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" id="personal-task-title" placeholder="Kişisel Hedefiniz (Örn: Kitap Okuma)..." required class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-emerald-500">
                    <select id="personal-task-category" class="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-sm text-stone-300 focus:outline-none focus:border-emerald-500">
                        <option value="Kur'an">📖 Kur'an</option>
                        <option value="Ezber">🎙️ Ezber</option>
                        <option value="Osmanlıca">📜 Osmanlıca</option>
                        <option value="Mütalaa">📚 Mütalaa</option>
                        <option value="Özel">✨ Özel</option>
                    </select>
                    <button type="submit" class="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold rounded-xl text-sm transition-colors py-2.5">Programıma Ekle</button>
                </form>
            </div>
        </div>
    `;
}

window.addCurriculumItem = async function(e) {
    e.preventDefault();
    const title = document.getElementById('curr-title').value.trim();
    const category = document.getElementById('curr-category').value;
    try {
        await setDoc(doc(collection(db, "curriculum")), { title, category });
        showNotification("Müfredata vazife eklendi!", "success");
        await loadCurriculum();
        render();
    } catch (err) {
        showNotification("Hata oluştu", "error");
    }
}

window.deleteCurriculumItem = async function(id) {
    if (confirm("Bu müfredat maddesini silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, "curriculum", id));
        await loadCurriculum();
        render();
    }
}

window.toggleTaskSelection = async function(currId, title, category) {
    const exists = state.tasks.find(t => t.curriculumId === currId);
    if (exists) {
        state.tasks = state.tasks.filter(t => t.curriculumId !== currId);
        showNotification("Vazife programınızdan çıkarıldı.", "info");
    } else {
        state.tasks.push({
            id: Date.now(),
            curriculumId: currId,
            title,
            category,
            completed: false,
            completedAt: null
        });
        showNotification("Vazife programınıza eklendi! 🎯", "success");
    }
    await saveUserData();
    render();
}

// Basit Tik (Check) Atma Fonksiyonu
window.toggleTaskComplete = async function(taskId) {
    const todayStr = getTodayString();
    state.tasks = state.tasks.map(t => {
        if (t.id === taskId) {
            const newCompleted = !t.completed;
            return {
                ...t,
                completed: newCompleted,
                completedAt: newCompleted ? todayStr : null
            };
        }
        return t;
    });
    await saveUserData();
    render();
}

setInterval(() => {
    if (state.user) {
        processDailyCheck().then(() => render());
    }
}, 60000);

render();
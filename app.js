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
    tasks: [
        { id: 1, title: "Kur'an-ı Kerim Cüz Okuma", category: "Kur'an", completed: false, isExtra: false },
        { id: 2, title: 'Osmanlıca Metin Çevirisi', category: 'Osmanlıca', completed: false, isExtra: false },
        { id: 3, title: 'Ezber Kaydı Yükleme', category: 'Ezber', completed: false, isExtra: false },
        { id: 4, title: 'Günün Mütalaası ve Notlar', category: 'Mütalaa', completed: false, isExtra: false }
    ],
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

// --- RENDER MİMARİSİ ---
function render() {
    const app = document.getElementById('app');
    
    if (!state.user) {
        app.innerHTML = renderLoginScreen();
        return;
    }

    app.innerHTML = `
        <!-- SOL YAN PANEL (Varsayılan Dar / Hover ile Genişler) -->
        <aside class="group w-20 hover:w-72 bg-stone-950 border-r border-stone-800 flex flex-col justify-between p-4 transition-all duration-300 z-30 overflow-hidden shadow-2xl">
            <div>
                <div class="flex items-center gap-3 mb-8 px-1">
                    <div class="p-2 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400 shrink-0">🌿</div>
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        <h1 class="font-bold text-base tracking-wide text-emerald-100">Medrese Gelişim</h1>
                        <p class="text-xs text-stone-400">İlim & İstikrar Takibi</p>
                    </div>
                </div>

                <nav class="space-y-1.5">
                    <button onclick="switchTab('dashboard')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${state.activeTab === 'dashboard' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'text-stone-400 hover:bg-stone-900'}">
                        <span class="text-lg shrink-0">🌲</span> <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Ana Ekran (Ağaç)</span>
                    </button>
                    <button onclick="switchTab('istatistik')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${state.activeTab === 'istatistik' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'text-stone-400 hover:bg-stone-900'}">
                        <span class="text-lg shrink-0">📊</span> <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">İstatistikler</span>
                    </button>
                    <button onclick="switchTab('kazanimlar')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${state.activeTab === 'kazanimlar' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'text-stone-400 hover:bg-stone-900'}">
                        <span class="text-lg shrink-0">🏆</span> <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Kazanımlar</span>
                    </button>
                    ${state.role === 'sorumlu' ? `
                        <button onclick="switchTab('sorumlu-paneli')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${state.activeTab === 'sorumlu-paneli' ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50' : 'text-amber-500/80 hover:bg-stone-900'}">
                            <span class="text-lg shrink-0">👤</span> <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Sorumlu Paneli</span>
                        </button>
                    ` : ''}
                    <button onclick="switchTab('ayarlar')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${state.activeTab === 'ayarlar' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'text-stone-400 hover:bg-stone-900'}">
                        <span class="text-lg shrink-0">⚙️</span> <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Ayarlar</span>
                    </button>
                </nav>
            </div>

            <div class="border-t border-stone-800 pt-4 space-y-3">
                <div class="px-1 text-xs text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                    Oturum: <strong class="text-stone-200">${state.user.email}</strong>
                </div>
                <button onclick="handleLogout()" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-lg">
                    <span class="text-lg shrink-0">🚪</span> <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Çıkış Yap</span>
                </button>
            </div>
        </aside>

        <!-- ANA İÇERİK -->
        <main class="flex-1 overflow-y-auto p-8 bg-stone-900">
            ${state.activeTab === 'dashboard' ? renderDashboard() : ''}
            ${state.activeTab === 'istatistik' ? renderStats() : ''}
            ${state.activeTab === 'kazanimlar' ? renderAwards() : ''}
            ${state.activeTab === 'sorumlu-paneli' && state.role === 'sorumlu' ? renderSupervisor() : ''}
            ${state.activeTab === 'ayarlar' ? renderSettings() : ''}
        </main>
    `;
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
    return `
        <div class="max-w-4xl mx-auto space-y-8">
            <header class="flex justify-between items-center bg-stone-950 p-6 rounded-2xl border border-stone-800">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">Günlük Vazifeler ve Hayat Ağacı</h2>
                    <p class="text-sm text-stone-400">Vazifelerinizi aksatmadan tamamlayın, ağacınız yeşersin.</p>
                </div>
                <div class="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 px-4 py-2 rounded-xl text-emerald-300">
                    <span class="text-sm font-semibold">🔥 Seri (Streak): ${state.streak} Gün</span>
                </div>
            </header>

            <!-- AĞAÇ DURUM ALANI -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
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

            <!-- VAZİFELER LİSTESİ VE YENİ VAZİFE EKLEME -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold">✅ Günün Vazifeleri</h3>
                </div>

                <!-- Yeni Vazife Ekleme Input Alanı -->
                <form onsubmit="addNewTask(event)" class="flex gap-2">
                    <input type="text" id="new-task-title" placeholder="Yeni vazife ekle (Örn: Risale okuması)..." required class="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-emerald-500">
                    <select id="new-task-category" class="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-sm text-stone-300 focus:outline-none focus:border-emerald-500">
                        <option value="Özel">Özel / Genel</option>
                        <option value="Kur'an">Kur'an</option>
                        <option value="Osmanlıca">Osmanlıca</option>
                        <option value="Ezber">Ezber</option>
                        <option value="Mütalaa">Mütalaa</option>
                    </select>
                    <button type="submit" class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl text-sm transition-colors shadow-lg">Ekle</button>
                </form>

                <div class="space-y-3">
                    ${state.tasks.map(task => `
                        <div class="p-4 rounded-2xl bg-stone-900 border ${task.isExtra ? 'border-amber-900/50 bg-amber-950/10' : 'border-stone-800'} flex items-center justify-between">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})" class="w-5 h-5 accent-emerald-500 rounded">
                                <span class="${task.completed ? 'line-through text-stone-500' : 'text-stone-200'} font-medium">${task.title}</span>
                            </label>
                            <span class="text-xs px-2.5 py-1 rounded-full ${task.isExtra ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-stone-800 text-stone-400'}">
                                ${task.isExtra ? '✨ Ek Vazife' : task.category}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderStats() {
    // Örnek hesaplamalar veya state üzerinden gelen veriler
    const totalStreak = state.streak || 0;
    const completedTasksCount = state.tasks.filter(t => t.completed).length;
    const totalTasksCount = state.tasks.length;
    const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <!-- Başlık -->
            <div class="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">İlerleme ve İstatistikler</h2>
                    <p class="text-sm text-stone-400">İlim yolundaki istikrarınızı ve günlük performansınızı görsel olarak takip edin.</p>
                </div>
                <div class="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400 text-xl">
                    📊
                </div>
            </div>

            <!-- Özet Kartları Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-stone-950 border border-stone-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">Aktif Seri (Streak)</p>
                        <h3 class="text-4xl font-extrabold text-emerald-400 mt-2">${totalStreak} <span class="text-lg font-normal text-stone-400">Gün</span></h3>
                    </div>
                    <div class="mt-4 pt-4 border-t border-stone-900 text-xs text-stone-500">
                        🔥 Her gün kesintisiz devam ediyor
                    </div>
                </div>

                <div class="bg-stone-950 border border-stone-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">Bugünkü Tamamlama</p>
                        <h3 class="text-4xl font-extrabold text-amber-400 mt-2">%${completionPercentage}</h3>
                    </div>
                    <div class="mt-4 pt-4 border-t border-stone-900 text-xs text-stone-500">
                        ✅ ${completedTasksCount} / ${totalTasksCount} Vazife Tamamlandı
                    </div>
                </div>

                <div class="bg-stone-950 border border-stone-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">Ağaç Sağlık Durumu</p>
                        <h3 class="text-2xl font-bold text-sky-400 mt-2">
                            ${state.treeState === 'growing' ? '🌳 Sağlıklı Büyüyor' : state.treeState === 'wilting' ? '🍂 Yaprak Döküyor' : '🌰 Tohum Aşamasında'}
                        </h3>
                    </div>
                    <div class="mt-4 pt-4 border-t border-stone-900 text-xs text-stone-500">
                        🌱 İstikrarına göre şekillenir
                    </div>
                </div>
            </div>

            <!-- Görsel İlerleme Çubuğu (Progress Bar) Alanı -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-8 space-y-6">
                <h3 class="text-lg font-bold text-stone-200">📈 Günlük Vazife Yoğunluğu ve Başarı</h3>
                
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-stone-400">Genel İlerleme Çubuğu</span>
                        <span class="text-emerald-400 font-semibold">%${completionPercentage}</span>
                    </div>
                    <div class="w-full bg-stone-900 h-4 rounded-full overflow-hidden p-0.5 border border-stone-800">
                        <div class="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500" style="width: ${completionPercentage}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-900 text-sm text-stone-400">
                    <div class="flex items-center gap-3 bg-stone-900/50 p-4 rounded-2xl border border-stone-800/60">
                        <span class="text-2xl">🏆</span>
                        <div>
                            <p class="font-semibold text-stone-200">İstikrar Seviyesi</p>
                            <p class="text-xs text-stone-500 mt-0.5">Seri gün sayısına göre kademe atlarsınız.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 bg-stone-900/50 p-4 rounded-2xl border border-stone-800/60">
                        <span class="text-2xl">💡</span>
                        <div>
                            <p class="font-semibold text-stone-200">İyileştirme Tavsiyesi</p>
                            <p class="text-xs text-stone-500 mt-0.5">Eksik kalan vazifeleri tamamlayarak ağacınızı koruyun.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAwards() { return `<div class="max-w-4xl mx-auto space-y-6"><h2 class="text-2xl font-bold">Kazanımlar</h2><p class="text-stone-400">Rozetleriniz listeleniyor.</p></div>`; }

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

function renderSettings() { return `<div class="max-w-4xl mx-auto space-y-6"><h2 class="text-2xl font-bold">Ayarlar</h2><p class="text-stone-400">Aktif Hesap: ${state.user.email}</p></div>`; }

// --- GLOBAL AKSİYONLAR ---
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

// Yeni Vazife Ekleme Fonksiyonu
window.addNewTask = async function(e) {
    e.preventDefault();
    const titleInput = document.getElementById('new-task-title');
    const categorySelect = document.getElementById('new-task-category');
    
    const newTask = {
        id: Date.now(), // Benzersiz ID
        title: titleInput.value.trim(),
        category: categorySelect.value,
        completed: false,
        isExtra: false
    };

    state.tasks.push(newTask);
    await saveUserData();
    showNotification("Yeni vazife eklendi!", "success");
    render();
}

window.toggleTask = async function(id) {
    state.tasks = state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    
    const extraTask = state.tasks.find(t => t.isExtra);
    if (extraTask && extraTask.completed && state.treeState === 'wilting') {
        state.treeState = 'growing';
        state.consecutiveFailures = 0;
        showNotification("Ek vazife tamamlandı! Ağacınız tekrar yeşerdi. 🌿", "success");
    }

    await saveUserData();
    render();
}

setInterval(() => {
    if (state.user) {
        processDailyCheck().then(() => render());
    }
}, 60000);

render();
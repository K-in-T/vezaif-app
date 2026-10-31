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

// --- DİNAMİK AĞAÇ FAZLARI MİMARİSİ ---
const BASE_PHASES = [
    'tohum1', 'tohum2', 'tohum3',
    'filiz1', 'filiz2', 'filiz3',
    'fide1', 'fide2', 'fide3',
    'cicek1', 'cicek2', 'cicek3'
];

function getPhaseLevelIndex(phase) {
    if (!phase) return 0;
    if (phase.startsWith('meyve')) {
        const num = parseInt(phase.replace('meyve', ''), 10) || 1;
        return BASE_PHASES.length + num - 1;
    }
    return BASE_PHASES.indexOf(phase) !== -1 ? BASE_PHASES.indexOf(phase) : 0;
}

function getPhaseString(index) {
    if (index < 0) index = 0;
    if (index < BASE_PHASES.length) {
        return BASE_PHASES[index];
    } else {
        const meyveNum = (index - BASE_PHASES.length) + 1;
        return `meyve${meyveNum}`;
    }
}

async function processDailyCheck() {
    const today = getTodayString();
    if (state.lastCheckDate && state.lastCheckDate !== today) {
        const daysPassed = getDaysBetween(state.lastCheckDate, today);
        const tasks = state.tasks || [];
        
        // O gün tamamlanan vazifeler
        const completedTasks = tasks.filter(t => t.completed);
        
        // Şart 1: Kur'an, Mütalaa ve Yazı (Osmanlıca) alanlarından en az birer tane tamamlanmış mı?
        const hasKuran = completedTasks.some(t => t.category === "Kur'an");
        const hasMutalaa = completedTasks.some(t => t.category === "Mütalaa" || t.category === "Arapça");
        const hasYazi = completedTasks.some(t => t.category === "Osmanlıca" || t.category === "Yazı");
        
        const coreCategoriesMet = hasKuran && hasMutalaa && hasYazi;
        
        // Şart 2: Bunlardan haricinde (ekstra) başka bir vazife yapılmış mı?
        // (Toplam tamamlanan sayısı 3'ten fazlaysa veya şahsi/özel/ezber gibi farklı kategoriler varsa)
        const hasExtraTask = completedTasks.length > 3 || completedTasks.some(t => t.isPersonal || t.category === "Ezber" || t.category === "Özel");

        let currentIndex = getPhaseLevelIndex(state.treePhase || 'tohum1');

        for (let i = 0; i < daysPassed; i++) {
            if (coreCategoriesMet) {
                if (hasExtraTask) {
                    // Üç temel şart tamam + ekstra vazife var -> Seviye Atlar
                    currentIndex++;
                } else {
                    // Üç temel şart tamam, ekstra yok -> Seviyesini Korur (currentIndex değişmez)
                }
            } else {
                // Üç temel şarttan biri veya hepsi eksik -> Seviyesi Sıfırlanır (En başa, tohum1'e düşer)
                currentIndex = 0; 
            }
        }

        state.treePhase = getPhaseString(currentIndex);
        
        // Yeni gün için görevlerin tamamlanma durumlarını sıfırlayabilirsiniz (İsteğe bağlı)
        state.tasks = state.tasks.map(t => ({
            ...t,
            completed: false,
            completedAt: null
        }));
        
        state.lastCodeDate = today;
        state.lastCheckDate = today;
        await saveUserData();
    }
}

function getTreePhaseDisplay(phase) {
    if (!phase) phase = 'tohum1';
    if (phase.startsWith('tohum')) {
        const sub = phase.replace('tohum', '');
        return { icon: '🌰', title: `Tohum Evresi (Seviye ${sub}/3)`, desc: 'İlim yolculuğunun ilk adımları, toprak altındaki hazırlık.' };
    } else if (phase.startsWith('filiz')) {
        const sub = phase.replace('filiz', '');
        return { icon: '🌱', title: `Filiz Evresi (Seviye ${sub}/3)`, desc: 'İstikrarla birlikte ilim fidanı topraktan baş gösteriyor.' };
    } else if (phase.startsWith('fide')) {
        const sub = phase.replace('fide', '');
        return { icon: '🌿', title: `Fide Evresi (Seviye ${sub}/3)`, desc: 'Kökler sağlamlaşıyor, fidan boy atmaya başladı.' };
    } else if (phase.startsWith('cicek')) {
        const sub = phase.replace('cicek', '');
        return { icon: '🌸', title: `Çiçek Evresi (Seviye ${sub}/3)`, desc: 'Gayretler meyve vermeye başladı, manevi manzaralar açılıyor.' };
    } else if (phase.startsWith('meyve')) {
        const sub = phase.replace('meyve', '');
        return { icon: '🍎', title: `Meyve Evresi (Seviye ${sub})`, desc: 'Zirve ilim ve olgunluk dönemi, istikrarın en güzel meyvesi.' };
    }
    return { icon: '🌳', title: 'İlim Ağacı', desc: 'Gelişimi sürdürün.' };
}

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

// Kullanıcı verisini çekerken döküman yoksa otomatik oluşturan fonksiyon
async function loadUserData(userUid) {
    try {
        const userRef = doc(db, "users", userUid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            // Firestore'da role alanı neyse onu al, yoksa 'normal' yap
            state.role = data.role || 'normal';
            state.treePhase = data.treePhase || 'tohum1';
            state.tasks = Array.isArray(data.tasks) ? data.tasks : [];
            state.lastCheckDate = data.lastCheckDate || null;
            state.streak = data.streak || 0;
        } else {
            // Eğer döküman yoksa varsayılan oluştur
            const defaultUserData = {
                email: state.user ? state.user.email : '',
                role: 'normal',
                treePhase: 'tohum1',
                tasks: [],
                streak: 0,
                lastCheckDate: getTodayString(),
                createdAt: new Date().toISOString()
            };
            
            await setDoc(userRef, defaultUserData);
            state.role = defaultUserData.role;
            state.treePhase = defaultUserData.treePhase;
            state.tasks = defaultUserData.tasks;
            state.lastCheckDate = defaultUserData.lastCheckDate;
        }
    } catch (err) {
        console.error("Kullanıcı verisi yüklenirken hata:", err);
        state.role = 'normal';
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = user;
        // Önce verileri yükle (role bilgisi burada state.role'e atanır)
        await loadUserData(user.uid);
        
        // Eğer okunan rol sorumlu ise talebeleri hemen çek
        if (state.role === 'sorumlu') {
            await loadStudents();
        }
    } else {
        state.user = null;
        state.role = 'normal';
        state.students = [];
    }
    render();
});

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
        console.warn("Talebe listesi yüklenemedi (Güvenlik kuralları kısıtlı olabilir):", error.message);
        state.students = []; // Uygulamanın çökmesini önler
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

// --- DUOLİNGO TARZI AYDINLIK GÜNDÜZ MODU & SABİT NAVİGASYON MİMARİSİ ---
function render() {
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

            <!-- 2. ANA İÇERİK ALANI (Boşluklar fixed menüler için ayarlandı) -->
            <main class="w-full flex-1 overflow-y-auto p-4 md:p-8 pb-28 pt-6 bg-stone-100">
                ${state.activeTab === 'dashboard' ? renderDashboard() : ''}
                ${state.activeTab === 'istatistik' ? renderStats() : ''}
                ${state.activeTab === 'kazanimlar' ? renderAwards() : ''}
                ${state.activeTab === 'müfredat' ? renderCurriculumTab() : ''}
                ${state.activeTab === 'sorumlu-paneli' && isSorumlu ? renderSupervisor() : ''}
                ${state.activeTab === 'ayarlar' ? renderSettings() : ''}
            </main>

            <!-- 3. ALT SABİT NAVİGASYON BARI (Duolingo Stili Sabit Menü) -->
            <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-stone-200 shadow-lg px-4 py-2">
                <div class="max-w-md mx-auto flex justify-around items-center">
                    
                    <button onclick="switchTab('dashboard')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${state.activeTab === 'dashboard' ? 'text-emerald-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-bold'}">
                        <span class="text-xl">🌳</span>
                        <span class="text-[10px] uppercase font-black">Ağaç</span>
                    </button>

                    <button onclick="switchTab('müfredat')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${state.activeTab === 'müfredat' ? 'text-emerald-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-bold'}">
                        <span class="text-xl">📖</span>
                        <span class="text-[10px] uppercase font-black">Müfredat</span>
                    </button>

                    <button onclick="switchTab('istatistik')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${state.activeTab === 'istatistik' ? 'text-emerald-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-bold'}">
                        <span class="text-xl">📊</span>
                        <span class="text-[10px] uppercase font-black">Analiz</span>
                    </button>

                    <button onclick="switchTab('kazanimlar')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${state.activeTab === 'kazanimlar' ? 'text-emerald-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-bold'}">
                        <span class="text-xl">🏆</span>
                        <span class="text-[10px] uppercase font-black">Rozetler</span>
                    </button>

                    ${isSorumlu ? `
                        <button onclick="switchTab('sorumlu-paneli')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${state.activeTab === 'sorumlu-paneli' ? 'text-amber-600 font-black scale-105' : 'text-amber-500/70 hover:text-amber-600 font-bold'}">
                            <span class="text-xl">🛡️</span>
                            <span class="text-[10px] uppercase font-black">Sorumlu</span>
                        </button>
                    ` : ''}

                    <button onclick="switchTab('ayarlar')" class="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${state.activeTab === 'ayarlar' ? 'text-emerald-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-bold'}">
                        <span class="text-xl">⚙️</span>
                        <span class="text-[10px] uppercase font-black">Ayarlar</span>
                    </button>

                </div>
            </nav>
        </div>
    `;

    const newMainElement = document.querySelector('main');
    if (newMainElement) {
        newMainElement.scrollTop = currentScrollTop;
    }
}

function renderLoginScreen() {
    return `
        <div class="flex items-center justify-center w-full h-full bg-stone-100 p-4">
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-md">
                <div class="text-center space-y-2">
                    <div class="inline-block p-4 bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 rounded-2xl text-emerald-600 text-3xl mb-2 shadow-sm">🏰</div>
                    <h2 class="text-2xl font-black text-slate-800">Medrese Gelişim</h2>
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
                    <button type="submit" class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-2xl text-sm transition-all shadow-md active:translate-y-0.5">Giriş Yap / Devam Et</button>
                </form>
            </div>
        </div>
    `;
}

function renderDashboard() {
    let totalStepsSum = 0;
    let completedStepsSum = 0;
    state.tasks.forEach(t => {
        totalStepsSum += (t.totalSteps || 1);
        completedStepsSum += (t.currentStep || (t.completed ? 1 : 0));
    });
    const progressPercent = totalStepsSum > 0 ? Math.round((completedStepsSum / totalStepsSum) * 100) : 0;
    const treeInfo = getTreePhaseDisplay(state.treePhase || 'tohum1');

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            
            <!-- ÜST KART: FAZ & İLERLEME -->
            <header class="bg-white p-5 md:p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 flex items-center justify-center text-3xl shadow-sm">
                        ${treeInfo.icon}
                    </div>
                    <div>
                        <span class="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                            ${state.treePhase || 'tohum1'} Aşaması
                        </span>
                        <h2 class="text-xl font-black text-slate-800 mt-1">${treeInfo.title}</h2>
                    </div>
                </div>

                <div class="bg-emerald-50 border-2 border-emerald-200 border-b-4 border-b-emerald-300 px-5 py-2.5 rounded-2xl flex items-center gap-3 w-full md:w-auto justify-between">
                    <div>
                        <div class="text-[11px] font-extrabold uppercase text-emerald-700">Günlük İlerleme</div>
                        <div class="text-sm font-black text-emerald-600">%${progressPercent} Tamamlandı</div>
                    </div>
                    <div class="w-9 h-9 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-lg shadow-md">
                        ⚡
                    </div>
                </div>
            </header>

            <!-- AĞAÇ ALANI -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-8 text-center relative overflow-hidden shadow-sm">
                <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none"></div>

                <div class="w-24 h-24 mx-auto rounded-3xl text-6xl flex items-center justify-center mb-4 bg-gradient-to-b from-emerald-100 to-emerald-200 border-2 border-emerald-300 border-b-4 border-b-emerald-400 shadow-md transform hover:scale-105 transition-transform duration-300">
                    ${treeInfo.icon}
                </div>
                
                <h3 class="text-2xl font-black mb-1 text-slate-800">${treeInfo.title}</h3>
                <p class="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">${treeInfo.desc}</p>
                
                <div class="w-full max-w-md mx-auto bg-stone-100 h-4 rounded-full mt-6 overflow-hidden p-0.5 border-2 border-stone-200 shadow-inner">
                    <div class="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm" style="width: ${progressPercent}%"></div>
                </div>
            </div>

            <!-- VAZİFELER LİSTESİ -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-black text-slate-800">📋 Günün Vazifeleri</h3>
                        <p class="text-xs text-slate-500 font-medium">Adımları tamamla, ağacını ve fazını büyüt!</p>
                    </div>
                    <button onclick="switchTab('müfredat')" class="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-500 border-b-4 border-b-amber-600 rounded-2xl text-xs font-black transition-all active:translate-y-0.5 shadow-sm flex items-center gap-1.5">
                        <span>📖</span> Müfredat & Ekle
                    </button>
                </div>

<div class="space-y-3.5">
    ${state.tasks.length > 0 ? state.tasks.map(task => `
        <div class="p-4 md:p-5 rounded-2xl ${task.completed ? 'bg-emerald-50/80 border-2 border-emerald-300 border-b-4 border-b-emerald-400' : 'bg-stone-50 border-2 border-stone-200 border-b-4 border-b-stone-300'} transition-all flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <!-- Tek tıkla tamamlamayı sağlayan Checkbox -->
                <label class="relative flex items-center justify-center cursor-pointer">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})" class="peer sr-only">
                    <div class="w-8 h-8 rounded-xl bg-white border-2 border-stone-300 border-b-4 border-b-stone-400 peer-checked:bg-emerald-500 peer-checked:border-emerald-600 peer-checked:border-b-emerald-700 flex items-center justify-center transition-all shadow-sm">
                        <svg class="w-5 h-5 text-white scale-0 peer-checked:scale-100 transition-transform font-black" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </label>
                <div class="space-y-1">
                    <h4 class="font-bold text-sm text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}">${task.title}</h4>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-stone-200 text-stone-700 uppercase tracking-wider">${task.category}</span>
                        ${task.isPersonal ? '<span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">Şahsi</span>' : ''}
                    </div>
                </div>
            </div>

            <!-- Silme Butonu -->
            <button onclick="deleteTask(${task.id})" class="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 border border-stone-200 hover:border-rose-300 transition-all text-xs" title="Kaldır">
                🗑️
            </button>
        </div>
    `).join('') : `
        <div class="text-center py-12 px-4 border-2 border-dashed border-stone-300 rounded-3xl bg-stone-50 space-y-4">
            <p class="text-sm font-bold text-slate-700">Programınızda henüz vazife bulunmuyor.</p>
            <button onclick="switchTab('müfredat')" class="px-6 py-3 bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-md">Müfredata Git</button>
        </div>
    `}
</div>
            </div>
        </div>
    `;
}

// --- İSTATİSTİKLER SEKMESİ ---
window.statsPeriod = window.statsPeriod || 'genel';
window.setStatsPeriod = function(period) { window.statsPeriod = period; render(); }

function renderStats() {
    const totalStreak = state.streak || 0;
    const completedTasksCount = state.tasks.filter(t => t.completed).length;
    const totalTasksCount = state.tasks.length;
    const todayCompletion = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    const categories = ["Kur'an", "Osmanlıca", "Ezber", "Mütalaa", "Özel"];
    
    const categoryStats = categories.map(cat => {
        const catTasks = state.tasks.filter(t => t.category === cat);
        const catTotal = catTasks.length;
        const catCompleted = catTasks.filter(t => t.completed).length;
        const percent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
        return { category: cat, total: catTotal, completed: catCompleted, percent };
    }).filter(c => c.total > 0);

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex flex-wrap justify-between items-center gap-4 shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">Gelişim & Performans Analizi</h2>
                    <p class="text-xs text-slate-500 font-medium">İstikrarınızı ve ders bazlı ilerlemenizi takip edin.</p>
                </div>
                
                <div class="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border-2 border-stone-200">
                    <button onclick="setStatsPeriod('haftalik')" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'haftalik' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Haftalık</button>
                    <button onclick="setStatsPeriod('aylik')" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'aylik' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Aylık</button>
                    <button onclick="setStatsPeriod('genel')" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'genel' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Genel</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
                    <div>
                        <p class="text-slate-400 text-[11px] font-black uppercase tracking-wider">Aktif Seri (Streak)</p>
                        <h3 class="text-4xl font-black text-emerald-600 mt-2">${totalStreak} <span class="text-sm font-bold text-slate-400">Gün</span></h3>
                    </div>
                    <div class="mt-4 pt-4 border-t-2 border-stone-100 text-xs text-slate-500 font-medium">🔥 Kesintisiz devam edilen gün</div>
                </div>

                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
                    <div>
                        <p class="text-slate-400 text-[11px] font-black uppercase tracking-wider">Bugünkü Başarı</p>
                        <h3 class="text-4xl font-black text-amber-500 mt-2">%${todayCompletion}</h3>
                    </div>
                    <div class="mt-4 pt-4 border-t-2 border-stone-100 text-xs text-slate-500 font-medium">✅ ${completedTasksCount} / ${totalTasksCount} Vazife</div>
                </div>

                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
                    <div>
                        <p class="text-slate-400 text-[11px] font-black uppercase tracking-wider">İlim Ağacı Durumu</p>
                        <h3 class="text-xl font-black text-emerald-600 mt-2">🌳 Gelişiyor</h3>
                    </div>
                    <div class="mt-4 pt-4 border-t-2 border-stone-100 text-xs text-slate-500 font-medium">🌱 Disiplinli ilerleyiş</div>
                </div>
            </div>

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 class="text-lg font-black text-slate-800">📖 Ders Bazlı İlerleme</h3>
                <div class="space-y-4">
                    ${categoryStats.length > 0 ? categoryStats.map(stat => `
                        <div class="space-y-1.5">
                            <div class="flex justify-between items-center text-sm">
                                <span class="font-bold text-slate-700">${stat.category}</span>
                                <span class="text-xs font-bold text-slate-500"><strong class="text-emerald-600">%${stat.percent}</strong> (${stat.completed}/${stat.total})</span>
                            </div>
                            <div class="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5 border-2 border-stone-200">
                                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${stat.percent}%"></div>
                            </div>
                        </div>
                    `).join('') : '<p class="text-xs text-slate-400 text-center py-4">Veri bulunmuyor.</p>'}
                </div>
            </div>
        </div>
    `;
}

// --- KAZANIMLAR SEKMESİ ---
function renderAwards() {
    const todayStr = state.lastCheckDate || new Date().toISOString().split('T')[0];
    const completedTasks = state.tasks.filter(t => t.completed);

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">Kazanımlar ve Rozetler</h2>
                    <p class="text-xs text-slate-500 font-medium">Tamamlanan vazifelerinizi ve rozetlerinizi inceleyin.</p>
                </div>
                <div class="p-3 bg-amber-100 border-2 border-amber-300 border-b-4 border-b-amber-400 rounded-2xl text-amber-700 text-xl shadow-sm">
                    🏆
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-4 rounded-3xl text-center space-y-1 shadow-sm">
                    <span class="text-3xl">🌱</span>
                    <p class="text-xs font-black text-slate-800">İlim Talebesi</p>
                    <p class="text-[10px] text-slate-400 font-bold">İlk Adım</p>
                </div>
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-4 rounded-3xl text-center space-y-1 shadow-sm ${state.streak >= 7 ? 'opacity-100' : 'opacity-40'}">
                    <span class="text-3xl">🔥</span>
                    <p class="text-xs font-black text-slate-800">7 Gün İstikrar</p>
                    <p class="text-[10px] text-slate-400 font-bold">${state.streak >= 7 ? 'Kazanıldı!' : 'Kilitli'}</p>
                </div>
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-4 rounded-3xl text-center space-y-1 shadow-sm ${state.streak >= 30 ? 'opacity-100' : 'opacity-40'}">
                    <span class="text-3xl">🌳</span>
                    <p class="text-xs font-black text-slate-800">Müstakim Ağaç</p>
                    <p class="text-[10px] text-slate-400 font-bold">${state.streak >= 30 ? 'Kazanıldı!' : 'Kilitli'}</p>
                </div>
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 p-4 rounded-3xl text-center space-y-1 shadow-sm ${completedTasks.length > 0 ? 'opacity-100' : 'opacity-40'}">
                    <span class="text-3xl">📜</span>
                    <p class="text-xs font-black text-slate-800">Vazife Mimarı</p>
                    <p class="text-[10px] text-slate-400 font-bold">${completedTasks.length > 0 ? 'Kazanıldı!' : 'Kilitli'}</p>
                </div>
            </div>

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 class="text-lg font-black text-slate-800">📅 Tamamlanan Vazifeler</h3>
                ${completedTasks.length > 0 ? `
                    <div class="space-y-3">
                        ${completedTasks.map(t => `
                            <div class="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="text-emerald-600 text-lg font-bold">✅</span>
                                    <div>
                                        <p class="text-sm font-bold text-slate-800">${t.title}</p>
                                        <p class="text-xs text-slate-400 font-medium">Alan: ${t.category}</p>
                                    </div>
                                </div>
                                <span class="px-3 py-1 bg-white text-emerald-700 border-2 border-emerald-200 rounded-xl text-xs font-mono font-black shadow-sm">
                                    🗓️ ${todayStr}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-center py-8 text-slate-400 text-xs font-medium">Bugün henüz tamamlanan vazife bulunmuyor.</p>'}
            </div>
        </div>
    `;
}

window.expandedStudentId = window.expandedStudentId || null;

window.toggleStudentCard = function(studentId) {
    window.expandedStudentId = window.expandedStudentId === studentId ? null : studentId;
    render();
}

function renderSupervisor() {
    return `
        <div class="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">🛡️ Sorumlu İdare Paneli</h2>
                    <p class="text-xs text-slate-500 font-medium">Talebelerin seviyelerini ve tamamladıkları son vazifeleri inceleyin.</p>
                </div>
                <button onclick="loadStudents().then(() => render())" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-xs border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm active:translate-y-0.5 transition-all">
                    🔄 Yenile
                </button>
            </div>

            <div class="space-y-4">
                ${state.students && state.students.length > 0 ? state.students.map(s => {
                    const isExpanded = window.expandedStudentId === s.id;
                    const treeInfo = getTreePhaseDisplay(s.treePhase || 'tohum1');
                    const studentTasks = s.tasks || [];
                    // Tamamlanmış vazifeleri filtrele
                    const completedTasks = studentTasks.filter(t => t.completed || t.completedAt);
                    
                    return `
                        <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl overflow-hidden shadow-sm transition-all">
                            <!-- Kart Başlığı (Tıklayınca Genişler) -->
                            <div onclick="toggleStudentCard('${s.id}')" class="p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 flex items-center justify-center text-2xl shadow-sm">
                                        ${treeInfo.icon}
                                    </div>
                                    <div>
                                        <h4 class="font-black text-slate-800 text-base">${s.email.split('@')[0]}</h4>
                                        <div class="flex items-center gap-2 mt-0.5">
                                            <span class="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                                                ${s.treePhase || 'tohum1'} (${treeInfo.title})
                                            </span>
                                            <span class="text-xs text-slate-400 font-bold">🔥 Seri: ${s.streak || 0} Gün</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-black text-slate-400">${isExpanded ? '▲ Kapat' : '▼ Detay'}</span>
                                </div>
                            </div>

                            <!-- Genişleyen Detay Alanı -->
                            ${isExpanded ? `
                                <div class="p-6 bg-stone-50 border-t-2 border-stone-200 space-y-4 animate-fadeIn">
                                    <h5 class="text-xs font-black text-slate-700 uppercase tracking-wider">📚 Tamamlanan Son Vazifeler</h5>
                                    
                                    ${completedTasks.length > 0 ? `
                                        <div class="space-y-2.5">
                                            ${completedTasks.map(t => `
                                                <div class="p-3.5 bg-white border-2 border-stone-200 rounded-2xl flex items-center justify-between shadow-sm">
                                                    <div class="space-y-0.5">
                                                        <div class="flex items-center gap-2">
                                                            <!-- Hangi alanda olduğu (Kategori) -->
                                                            <span class="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">${t.category}</span>
                                                            <!-- Hangi vazifeyi tamamladığı -->
                                                            <span class="text-xs font-bold text-slate-800">${t.title}</span>
                                                        </div>
                                                    </div>
                                                    <span class="text-[11px] font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                                                        ✅ ${t.completedAt || s.lastCheckDate || 'Bugün'}
                                                    </span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <div class="text-center py-6 bg-white border-2 border-dashed border-stone-300 rounded-2xl">
                                            <p class="text-xs text-stone-500 font-medium">Bu talebenin henüz tamamlanmış bir vazifesi bulunmuyor.</p>
                                        </div>
                                    `}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('') : `
                    <div class="text-center py-12 bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl shadow-sm space-y-3">
                        <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl">👥</div>
                        <p class="text-sm font-bold text-slate-700">Sistemde kayıtlı talebe bulunamadı.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderSettings() {
    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">Ayarlar ve Hesap</h2>
                    <p class="text-xs text-slate-500 font-medium">Oturum bilgilerinizi yönetin.</p>
                </div>
                <div class="p-3 bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 rounded-2xl text-emerald-700 text-xl shadow-sm">
                    ⚙️
                </div>
            </div>

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 class="text-lg font-black text-slate-800">Oturum Bilgileri</h3>
                <div class="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">E-posta Adresi</p>
                        <p class="text-sm font-black text-slate-800 mt-0.5">${state.user ? state.user.email : ''}</p>
                    </div>
                    <span class="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-black shadow-sm">Aktif</span>
                </div>

                <div class="pt-4 border-t-2 border-stone-100 flex justify-between items-center">
                    <div>
                        <h4 class="text-sm font-black text-rose-600">Oturumu Kapat</h4>
                        <p class="text-xs text-slate-400 font-medium mt-0.5">Güvenli bir şekilde çıkış yapın.</p>
                    </div>
                    <button onclick="handleLogout()" class="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 border-b-4 border-b-rose-300 font-black rounded-2xl text-xs transition-all active:translate-y-0.5">
                        🚪 Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- MÜFREDAT TABLOSU & KURLAR ---
const STATIC_CURRICULUM = [
    {
        level: 1,
        title: "1. Kur (Başlangıç Seviyesi)",
        description: "Temel medrese disiplini, günlük Kur'an okuması, mütalaa ve yazı temelleri.",
        tasks: [
            { id: 'k1_t1', title: "Kur'an-ı Kerim (Yüzünden / 1 Cüz)", category: "Kur'an" },
            { id: 'k1_t2', title: "Risale-i Nur Mütalaası (5 Sayfa)", category: "Mütalaa" },
            { id: 'k1_t3', title: "Osmanlıca Temel Metin Okuma", category: "Yazı" },
            { id: 'k1_t4', title: "Temel Ezber (Kısa Sureler)", category: "Ezber" }
        ]
    },
    {
        level: 2,
        title: "2. Kur (Gelişme Seviyesi)",
        description: "Arapça gramer başlangıcı ve metin okuma pratiklerinin artırılması.",
        tasks: [
            { id: 'k2_t1', title: "Kur'an-ı Kerim (1 Cüz)", category: "Kur'an" },
            { id: 'k2_t2', title: "Risale-i Nur Mütalaası (10 Sayfa)", category: "Mütalaa" },
            { id: 'k2_t3', title: "Osmanlıca Yazma ve Metin Çözümleme", category: "Yazı" },
            { id: 'k2_t4', title: "Arapça Sarf Çalışması (Emsile)", category: "Mütalaa" }
        ]
    },
    {
        level: 3,
        title: "3. Kur (Orta Seviye)",
        description: "Arapça nahif adımları, derinlemesine mütalaa ve hıfz başlangıcı.",
        tasks: [
            { id: 'k3_t1', title: "Kur'an-ı Kerim (1 Cüz)", category: "Kur'an" },
            { id: 'k3_t2', title: "Risale-i Nur Mütalaası (15 Sayfa)", category: "Mütalaa" },
            { id: 'k3_t3', title: "Osmanlıca Arşiv Metinleri Okuması", category: "Yazı" },
            { id: 'k3_t4', title: "Arapça Sarf (Bina / Avamil)", category: "Mütalaa" }
        ]
    },
    {
        level: 4,
        title: "4. Kur (İleri Başlangıç)",
        description: "Metin tahlilleri, nahiv çalışmaları ve istikrarlı okumalar.",
        tasks: [
            { id: 'k4_t1', title: "Kur'an-ı Kerim Mukabele", category: "Kur'an" },
            { id: 'k4_t2', title: "Risale-i Nur Mütalaası (20 Sayfa)", category: "Mütalaa" },
            { id: 'k4_t3', title: "Osmanlıca Süratli Metin Okuma", category: "Yazı" },
            { id: 'k4_t4', title: "Arapça Nahiv (İzhari)", category: "Mütalaa" }
        ]
    },
    {
        level: 5,
        title: "5. Kur (Merkez Seviye)",
        description: "Orta-İleri düzey Arapça gramer ve şerh mütalaaları.",
        tasks: [
            { id: 'k5_t1', title: "Kur'an-ı Kerim & Tefsir Okuması", category: "Kur'an" },
            { id: 'k5_t2', title: "Risale-i Nur Külliyatı Mütalaası", category: "Mütalaa" },
            { id: 'k5_t3', title: "Osmanlıca Edebi Metin Analizi", category: "Yazı" },
            { id: 'k5_t4', title: "Arapça Nahiv (Kafiye)", category: "Mütalaa" }
        ]
    },
    {
        level: 6,
        title: "6. Kur (Yüksek İlimler - 1)",
        description: "İleri düzey Arapça metin tahlili ve fıkıh usulü giriş.",
        tasks: [
            { id: 'k6_t1', title: "Kur'an-ı Kerim Hafızlık / Tekrar", category: "Kur'an" },
            { id: 'k6_t2', title: "Ali Mütalaa ve Tahlil Çalışması", category: "Mütalaa" },
            { id: 'k6_t3', title: "Osmanlıca Hüsn-i Hat / Yazı Çalışması", category: "Yazı" },
            { id: 'k6_t4', title: "Fıkıh Usulü Mütalaası", category: "Mütalaa" }
        ]
    },
    {
        level: 7,
        title: "7. Kur (Yüksek İlimler - 2)",
        description: "Kelam ve akâid sahasında derinlemesine eser mütalaaları.",
        tasks: [
            { id: 'k7_t1', title: "Kur'an-ı Kerim Mukabele", category: "Kur'an" },
            { id: 'k7_t2', title: "Akâid ve Kelam Mütalaası", category: "Mütalaa" },
            { id: 'k7_t3', title: "Osmanlıca Divan Edebiyatı Metinleri", category: "Yazı" },
            { id: 'k7_t4', title: "Arapça Şerhli Metin Okumaları", category: "Mütalaa" }
        ]
    },
    {
        level: 8,
        title: "8. Kur (İhtisas - 1)",
        description: "Tefsir ve hadis ilimlerinde ihtisaslaşma adımları.",
        tasks: [
            { id: 'k8_t1', title: "Tefsir Usulü ve Kur'an Araştırması", category: "Kur'an" },
            { id: 'k8_t2', title: "Hadis Metinleri Mütalaası", category: "Mütalaa" },
            { id: 'k8_t3', title: "Osmanlıca Belagat Metinleri", category: "Yazı" },
            { id: 'k8_t4', title: "İleri Düzey Belagat (Maânî)", category: "Mütalaa" }
        ]
    },
    {
        level: 9,
        title: "9. Kur (İhtisas - 2)",
        description: "Müntesip seviye ilmi çalışmalar ve risale tetkikleri.",
        tasks: [
            { id: 'k9_t1', title: "Kur'an-ı Kerim Araştırmaları", category: "Kur'an" },
            { id: 'k9_t2', title: "İleri Mütalaa & Müzakere", category: "Mütalaa" },
            { id: 'k9_t3', title: "Osmanlıca Telif ve Rapor Hazırlama", category: "Yazı" },
            { id: 'k9_t4', title: "İslam Tarihi ve Siyer Mütalaası", category: "Mütalaa" }
        ]
    },
    {
        level: 10,
        title: "10. Kur (Zirve / İcazet Seviyesi)",
        description: "Medrese müfredatının en üst noktası, tamim ve icazet hazırlığı.",
        tasks: [
            { id: 'k10_t1', title: "Kur'an-ı Kerim Hatim ve Hafızlık İkmali", category: "Kur'an" },
            { id: 'k10_t2', title: "Külliyat ve Tedrisat Mütalaası", category: "Mütalaa" },
            { id: 'k10_t3', title: "Osmanlıca Klasik Eser İncelemesi", category: "Yazı" },
            { id: 'k10_t4', title: "İlmi Araştırma ve Müzakere", category: "Mütalaa" }
        ]
    }
];

window.showCurriculumInfo = window.showCurriculumInfo || false;

window.toggleCurriculumInfo = function() {
    window.showCurriculumInfo = !window.showCurriculumInfo;
    render();
}

function renderCurriculumTab() {
    const currentCourse = STATIC_CURRICULUM.find(c => c.level === window.selectedCourseLevel) || STATIC_CURRICULUM[0];
    const isInfoOpen = window.showCurriculumInfo;

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            
            <!-- BAŞLIK VE INFO BUTONU -->
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex flex-wrap justify-between items-center gap-4 shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">📖 Medrese Kurları (1 - 10)</h2>
                    <p class="text-xs text-slate-500 font-medium">Bulunduğunuz kuru seçerek vazifelerinizi ekleyin.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button onclick="toggleCurriculumInfo()" class="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border-2 border-sky-300 border-b-4 border-b-sky-400 rounded-2xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 active:translate-y-0.5">
                        <span>ℹ️</span> ${isInfoOpen ? 'Yönergeyi Gizle' : 'Yönerge & Kuralları Göster'}
                    </button>
                </div>
            </div>

            <!-- KAPSAMLI YÖNERGE & KURALLAR PANELİ -->
            ${isInfoOpen ? `
                <div class="bg-sky-50 border-2 border-sky-300 border-b-4 border-b-sky-400 rounded-3xl p-6 md:p-8 space-y-4 animate-fadeIn relative shadow-sm">
                    <div class="flex justify-between items-center border-b-2 border-sky-200 pb-3">
                        <h4 class="font-black text-sky-900 text-base flex items-center gap-2">
                            <span>📜</span> Medrese İlim Ağacı ve Günlük Disiplin Yönergesi
                        </h4>
                        <button onclick="toggleCurriculumInfo()" class="text-xs font-black text-sky-700 hover:text-sky-900 px-3 py-1 bg-white rounded-xl border-2 border-sky-200 shadow-sm">Kapat X</button>
                    </div>

                    <div class="space-y-3 text-xs text-sky-900 font-medium leading-relaxed">
                        <div class="bg-white/80 p-4 rounded-2xl border border-sky-200 space-y-1">
                            <strong class="text-sky-950 font-black block text-sm">1. Temel Üçlü Şartı (Koruma Kuralı):</strong>
                            <p>Sistemin sürdürülebilir olması ve ağacınızın kurumaması için her gün mutlaka <strong>Kur'an</strong>, <strong>Mütalaa</strong> ve <strong>Yazı (Osmanlıca)</strong> alanlarının <em>her birinden</em> en az birer vazife tamamlamalısınız.</p>
                        </div>

                        <div class="bg-white/80 p-4 rounded-2xl border border-sky-200 space-y-1">
                            <strong class="text-sky-950 font-black block text-sm">2. Seviye Sıfırlanma (Ceza) Durumu:</strong>
                            <p>Eğer yukarıda belirtilen üç temel alandan biri bile o gün eksik kalırsa, gece kontrol mekanizması devreye girer ve ağacınızın seviyesi doğrudan başa (en alt basamak olan <strong>tohum1</strong> evresine) sıfırlanır.</p>
                        </div>

                        <div class="bg-white/80 p-4 rounded-2xl border border-sky-200 space-y-1">
                            <strong class="text-sky-950 font-black block text-sm">3. Seviye Atlama ve İlerleme Kuralı:</strong>
                            <p>Üç temel alanın şartını yerine getirdikten sonra, programınıza eklediğiniz <strong>ekstra veya şahsi vazifeleri</strong> de tamamlarsanız ağacınız bir üst seviyeye yükselir.</p>
                        </div>

                        <div class="bg-white/80 p-4 rounded-2xl border border-sky-200 space-y-1">
                            <strong class="text-sky-950 font-black block text-sm">4. Evre Yapısı ve Meyve Dönemi:</strong>
                            <p>Evreler 3'erli aşamalar halinde (Tohum 1-3, Filiz 1-3, Fide 1-3, Çiçek 1-3) ilerler. Bu temel aşamaları başarıyla geçtiğinizde, ilmin olgunluk dönemi olan ve seviyesi sınırsız olarak artan <strong>Meyve</strong> evrelerine ulaşırsınız.</p>
                    </div>
                </div>
            ` : ''}

            <!-- 10 KUR SEÇİM KAYDIRMASI (Yatay Scroll) -->
<div class="bg-white p-4 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 shadow-sm overflow-x-auto flex items-center gap-2">
    ${STATIC_CURRICULUM.map(course => {
        const isSelected = window.selectedCourseLevel === course.level;
        return `
            <button onclick="setCourseLevel(${course.level})" class="px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected ? 'bg-emerald-500 text-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm' :
                'bg-stone-50 text-slate-700 hover:text-slate-900 border-2 border-stone-200'
            }">
                📖 ${course.level}. Kur
            </button>
        `;
    }).join('')}
</div>

            <!-- SEÇİLİ KURUN DETAYLARI VE VAZİFELER -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div class="border-b-2 border-stone-100 pb-4">
                    <span class="text-[11px] font-black px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-mono">Seviye: ${currentCourse.level}. Kur</span>
                    <h3 class="text-xl font-black text-slate-800 mt-2">${currentCourse.title}</h3>
                    <p class="text-xs text-slate-500 font-medium mt-1">${currentCourse.description}</p>
                </div>

                <div class="space-y-3.5">
                    ${currentCourse.tasks.map(item => {
                        const isInMyTasks = state.tasks.some(t => t.curriculumId === item.id);
                        return `
                            <div class="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl flex justify-between items-center">
                                <div class="space-y-1">
                                    <h5 class="font-bold text-sm text-slate-800">${item.title}</h5>
                                    <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-stone-200 text-stone-700 uppercase tracking-wider">${item.category}</span>
                                </div>
                                <button onclick="toggleTaskSelection('${item.id}')" class="px-4 py-2 rounded-2xl text-xs font-black transition-all ${isInMyTasks ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300' : 'bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm'}">
                                    ${isInMyTasks ? '✓ Programımda' : '+ Programıma Ekle'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- ŞAHSİ VAZİFE EKLEME -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <div>
                    <h3 class="text-lg font-black text-slate-800">✨ Şahsi Ek Vazife Oluştur</h3>
                    <p class="text-xs text-slate-500 font-medium">Kendi hususi hedeflerinizi buradan ekleyin.</p>
                </div>
                <form onsubmit="addPersonalTask(event)" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" id="personal-task-title" placeholder="Kişisel Hedefiniz..." required class="bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500">
                    <select id="personal-task-category" class="bg-stone-50 border-2 border-stone-200 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500">
                        <option value="Kur'an">📖 Kur'an</option>
                        <option value="Mütalaa">📚 Mütalaa</option>
                        <option value="Yazı">📜 Yazı / Osmanlıca</option>
                        <option value="Ezber">🎙️ Ezber</option>
                        <option value="Özel">✨ Özel</option>
                    </select>
                    <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-2xl text-sm transition-all shadow-md active:translate-y-0.5 py-2.5">Programıma Ekle</button>
                </form>
            </div>
        </div>
    `;
}

// --- GLOBAL AKSİYONLAR ---
// Kullanıcının tamamladığı veya açtığı en yüksek kur seviyesi (Varsayılan: 1)

window.setCourseLevel = function(level) {
    window.selectedCourseLevel = level;
    render();
}

// Müfredattan ders eklerken kural kontrolü
window.toggleTaskSelection = async function(currId) {
    let targetCourse = null;
    let foundItem = null;
    
    for (const course of STATIC_CURRICULUM) {
        const match = course.tasks.find(t => t.id === currId);
        if (match) { 
            targetCourse = course;
            foundItem = match; 
            break; 
        }
    }
    
    if (!foundItem || !targetCourse) return;

    // TAMAMLAYICI KURAL KONTROLÜ: Alt kur bitmeden üst kurdan ders eklenemez!
    if (targetCourse.level > window.userUnlockedLevel) {
        showNotification(`Kural gereği alt kurlar bitmeden üst kur vazifeleri eklenemez (${window.userUnlockedLevel}. kurda bulunuyorsunuz).`, "error");
        return;
    }

    const exists = state.tasks.find(t => t.curriculumId === currId);
    if (exists) {
        state.tasks = state.tasks.filter(t => t.curriculumId !== currId);
        showNotification("Vazife programınızdan çıkarıldı.", "info");
    } else {
        state.tasks.push({
            id: Date.now(),
            curriculumId: currId,
            title: foundItem.title,
            category: foundItem.category,
            level: targetCourse.level,
            completed: false,
            completedAt: null
        });
        showNotification("Vazife programınıza eklendi! 🎯", "success");
    }
    await saveUserData();
    render();
}

window.updateTaskProgress = async function(taskId, change) {
    const today = getTodayString();
    state.tasks = state.tasks.map(task => {
        if (task.id === taskId) {
            let newStep = (task.currentStep || 1) + change;
            const total = task.totalSteps || 1;
            if (newStep < 1) newStep = 1;
            if (newStep > total) newStep = total;
            const isFinished = newStep >= total;

            return {
                ...task,
                currentStep: newStep,
                completed: isFinished,
                lastProgressDate: today,
                completedAt: isFinished ? today : null
            };
        }
        return task;
    });
    await saveUserData();
    render();
}

// Şahsi vazife ekleme
window.addPersonalTask = async function(e) {
    e.preventDefault();
    const titleInput = document.getElementById('personal-task-title');
    const categorySelect = document.getElementById('personal-task-category');
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    if (!title) return;

    state.tasks.push({
        id: Date.now(),
        curriculumId: `personal_${Date.now()}`,
        title,
        category,
        completed: false, // Sadece tamamlandı durumu
        completedAt: null,
        isPersonal: true
    });

    await saveUserData();
    showNotification("Özel vazifeniz eklendi! ✨", "success");
    render();
}

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

window.deleteTask = async function(taskId) {
    if (confirm("Bu vazifeyi kaldırmak istediğinize emin misiniz?")) {
        state.tasks = state.tasks.filter(t => t.id != taskId);
        await saveUserData();
        showNotification("Vazife kaldırıldı.", "info");
        render();
    }
}

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
}

window.handleLogout = async function() {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        await signOut(auth);
        showNotification("Çıkış yapıldı.", "success");
    }
}

window.switchTab = async function(tab) { 
    state.activeTab = tab; 
    
    console.log("Aktif Rol:", state.role, "Tıklanan Sekme:", tab); // Kontrol için

    if (tab === 'sorumlu-paneli') {
        if (state.role === 'sorumlu') {
            await loadStudents();
        } else {
            console.warn("Bu kullanıcı sorumlu yetkisine sahip değil!");
        }
    }
    render(); 
}

setInterval(() => {
    if (state.user) {
        processDailyCheck().then(() => render());
    }
}, 60000);

render();
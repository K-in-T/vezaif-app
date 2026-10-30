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
    'tohum1', 'tohum2', 'tohum3', 'tohum4', 'tohum5',
    'filiz1', 'filiz2', 'filiz3', 'filiz4', 'filiz5',
    'fide1', 'fide2', 'fide3', 'fide4', 'fide5',
    'cicek1', 'cicek2', 'cicek3', 'cicek4', 'cicek5'
];

// Fazın indexini veya meyve seviyesini bulan yardımcı fonksiyon
function getPhaseLevelIndex(phase) {
    if (phase.startsWith('meyve')) {
        const num = parseInt(phase.replace('meyve', ''), 10) || 1;
        return BASE_PHASES.length + num - 1; // Base fazların üzerindeki her meyve kademesi
    }
    return BASE_PHASES.indexOf(phase);
}

// Index değerine göre faz stringini üreten fonksiyon
function getPhaseString(index) {
    if (index < 0) index = 0;
    if (index < BASE_PHASES.length) {
        return BASE_PHASES[index];
    } else {
        // Meyve fazı sonrası sonsuz artış (`meyve6`, `meyve7`...)
        const meyveNum = (index - BASE_PHASES.length) + 1;
        return `meyve${meyveNum}`;
    }
}

async function processDailyCheck() {
    const today = getTodayString();
    if (state.lastCheckDate && state.lastCheckDate !== today) {
        const daysPassed = getDaysBetween(state.lastCheckDate, today);
        
        // O gün (veya önceki günlerde) üzerinde çalışılmış/ilerlenmiş parçalar veya tamamlananlar
        const tasks = state.tasks;
        const totalTasksCount = tasks.length;
        
        // Tüm görevlerin ya tamamen bittiği ya da toplam adımlarının büyük oranda tamamlandığı durum
        // Veya kullanıcının isteği üzerine: O gün parçaları tamamlanan / ilerletilen vazifeler
        const completedOrProgressed = tasks.filter(t => t.completed || (t.currentStep > 1));
        const allCompleted = totalTasksCount > 0 && tasks.every(t => t.completed);
        
        // Kategori Şartı: Kur'an, Osmanlıca ve Mütalaa alanlarından en az birer tanesinde parça ilerlemesi veya tamamlama olmalı
        const hasKuran = completedOrProgressed.some(t => t.category === "Kur'an");
        const hasOsmanlica = completedOrProgressed.some(t => t.category === "Osmanlıca");
        const hasMutalaa = completedOrProgressed.some(t => t.category === "Mütalaa");
        
        const categoryConditionMet = hasKuran && hasOsmanlica && hasMutalaa;

        // Ek/Kişisel vazife yapılmış mı?
        const hasExtraTask = completedOrProgressed.some(t => t.isPersonal && (t.completed || t.currentStep > 1));

        let currentIndex = getPhaseLevelIndex(state.treePhase || 'tohum1');
        if (currentIndex === -1) currentIndex = 0;

        for (let i = 0; i < daysPassed; i++) {
            // Eğer temel şartlar (kategori dengesi ve aktif çalışma) sağlanmışsa
            if (allCompleted || (categoryConditionMet && completedOrProgressed.length > 0)) {
                if (hasExtraTask && allCompleted) {
                    currentIndex++; // Tamamlama + Ek vazife -> Faz atlar
                } else {
                    // Parçalar ilerletilmiş, kategori şartı sağlanmış -> Fazı korur veya istikrara göre ilerler
                }
            } else {
                // Hiçbir şey yapılmamış / eksik kalmış -> 1 Faz Düşer
                if (currentIndex > 0) currentIndex--;
            }
        }

        state.treePhase = getPhaseString(currentIndex);
        // Not: Çok adımlı (totalSteps > 1) görevler sıfırlanmaz çünkü süreçleri devam ediyordur, 
        // ancak 1 günlük/tek adımlı görevlerin "completed" bayrakları yeni gün için sıfırlanabilir.
        state.tasks = state.tasks.map(t => ({
            ...t,
            completed: t.currentStep >= t.totalSteps,
            completedAt: t.currentStep >= t.totalSteps ? t.completedAt : null
        }));
        
        state.lastCheckDate = today;
        await saveUserData();
    }
}

function getTreePhaseDisplay(phase) {
    if (phase.startsWith('tohum')) {
        const sub = phase.replace('tohum', '');
        return { icon: '🌰', title: `Tohum Evresi (Seviye ${sub})`, desc: 'İlim yolculuğunun ilk adımları, toprak altındaki hazırlık.' };
    } else if (phase.startsWith('filiz')) {
        const sub = phase.replace('filiz', '');
        return { icon: '🌱', title: `Filiz Evresi (Seviye ${sub})`, desc: 'İstikrarla birlikte ilim fidanı topraktan baş gösteriyor.' };
    } else if (phase.startsWith('fide')) {
        const sub = phase.replace('fide', '');
        return { icon: '🌿', title: `Fide Evresi (Seviye ${sub})`, desc: 'Kökler sağlamlaşıyor, fidan boy atmaya başladı.' };
    } else if (phase.startsWith('cicek')) {
        const sub = phase.replace('cicek', '');
        return { icon: '🌸', title: `Çiçek Evresi (Seviye ${sub})`, desc: 'Gayretler meyve vermeye başladı, manevi manzaralar açılıyor.' };
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

// Kullanıcı verisini çekerken döküman yoksa otomatik oluşturan fonksiyon
async function loadUserData(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            state.role = data.role || 'normal';
            state.treePhase = data.treePhase || 'tohum1';
            state.tasks = data.tasks || [];
            state.lastCheckDate = data.lastCheckDate || null;
        } else {
            // EĞER FIRESTORE'DA DÖKÜMAN YOKSA YENİDEN OLUŞTUR
            const defaultUserData = {
                email: user.email,
                role: 'normal', // İlk kayıt olanlar normal talebe başlar
                treePhase: 'tohum1',
                tasks: [],
                lastCheckDate: getTodayString(),
                createdAt: new Date().toISOString()
            };
            
            await setDoc(userRef, defaultUserData);
            
            state.role = defaultUserData.role;
            state.treePhase = defaultUserData.treePhase;
            state.tasks = defaultUserData.tasks;
            state.lastCheckDate = defaultUserData.lastCheckDate;
            
            console.log("Yeni kullanıcı için Firestore dökümanı oluşturuldu.");
        }
    } catch (err) {
        console.error("Kullanıcı verisi yüklenirken hata:", err);
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
                </nav>
                <div class="flex items-center gap-3">
                        <button onclick="switchTab('ayarlar')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${state.activeTab === 'ayarlar' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 shadow-sm' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}">
                        <span>⚙️</span> Ayarlar
                    </button>
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
    
    // Yeni ağaç fazı bilgisini alıyoruz
    const treeInfo = getTreePhaseDisplay(state.treePhase || 'tohum1');

    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <header class="flex justify-between items-center bg-stone-950 p-6 rounded-2xl border border-stone-800">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">Günlük Vazifeler ve İlim Ağacı</h2>
                    <p class="text-sm text-stone-400">Müfredattan seçtiğiniz vazifeleri tamamlayın. Gece 00:00'da fazınız otomatik güncellenir.</p>
                </div>
                <div class="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 px-4 py-2 rounded-xl text-emerald-300">
                    <span class="text-sm font-semibold uppercase tracking-wider">🌿 Faz: ${state.treePhase || 'tohum1'}</span>
                </div>
            </header>

            <!-- AĞAÇ DURUM ALANI (YENİ FAZ SİSTEMİ) -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
                <div class="p-6 rounded-full text-6xl mb-4 bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 shadow-lg shadow-emerald-950 transition-all duration-500">
                    ${treeInfo.icon}
                </div>
                <span class="text-xs px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-mono mb-2 uppercase font-semibold">
                    ${state.treePhase || 'tohum1'}
                </span>
                <h3 class="text-xl font-bold mb-1 text-stone-100">${treeInfo.title}</h3>
                <p class="text-xs text-stone-400 max-w-md">${treeInfo.desc}</p>
            </div>

            <!-- VAZİFELER LİSTESİ VE MÜFREDATA YÖNLENDİRME -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold">📋 Günün Vazifeleri</h3>
                    <button onclick="switchTab('müfredat')" class="text-xs px-3 py-1.5 bg-emerald-900/40 text-emerald-300 border border-emerald-800 rounded-xl hover:bg-emerald-900/60 transition-colors">
                        📖 Müfredata Git & Vazife Seç
                    </button>
                </div>

                <!-- VAZİFELER LİSTESİ (Parçalı / Checkbox ile) -->
                <div class="space-y-3">
                    ${state.tasks.length > 0 ? state.tasks.map(task => {
                        const current = task.currentStep || 1;
                        const total = task.totalSteps || 1;

                        return `
                            <div class="p-4 rounded-2xl bg-stone-900 border ${task.completed ? 'border-emerald-900/50 bg-emerald-950/10' : 'border-stone-800'} flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    ${total === 1 ? `
                                        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})" class="w-5 h-5 accent-emerald-600 rounded cursor-pointer">
                                    ` : `
                                        <div class="flex items-center gap-1 font-mono text-xs bg-stone-800 px-2.5 py-1 rounded-lg text-emerald-400 font-bold">
                                            <span>${current}/${total}</span>
                                        </div>
                                    `}
                                    <div>
                                        <h4 class="font-semibold text-stone-100 ${task.completed ? 'line-through text-stone-400' : ''}">${task.title}</h4>
                                        <span class="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400">${task.category} ${task.isPersonal ? '(Şahsi)' : ''}</span>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <!-- Çok adımlı/parçalı vazifeler için - / + butonları -->
                                    ${total > 1 ? `
                                        <div class="flex items-center gap-1 bg-stone-950 border border-stone-800 p-1 rounded-xl">
                                            <button onclick="updateTaskProgress(${task.id}, -1)" class="w-7 h-7 flex items-center justify-center bg-stone-800 text-stone-300 rounded-lg text-xs hover:bg-stone-700 transition-colors">-</button>
                                            <span class="text-xs px-2 font-mono text-stone-200 font-semibold">${current}/${total}</span>
                                            <button onclick="updateTaskProgress(${task.id}, 1)" class="w-7 h-7 flex items-center justify-center bg-emerald-900 text-emerald-200 rounded-lg text-xs hover:bg-emerald-800 transition-colors">+</button>
                                        </div>
                                    ` : ''}

                                    <!-- LİSTEDEN ÇIKARMA (SİLME) -->
                                    <button onclick="deleteTask(${task.id})" class="text-stone-500 hover:text-red-400 text-xs px-2 py-1">🗑️ Kaldır</button>
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div class="text-center py-10 text-stone-500 space-y-3 border border-dashed border-stone-800 rounded-2xl">
                            <span class="text-3xl">📚</span>
                            <p class="text-sm font-medium">Günlük programınızda henüz vazife bulunmuyor.</p>
                            <p class="text-xs text-stone-600">Müfredattan derslerinizi seçmek veya şahsi vazife eklemek için müfredat sekmesini kullanın.</p>
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
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    
    if (!emailInput || !passInput) return;

    const email = emailInput.value.trim();
    const pass = passInput.value.trim();

    if (!email || !pass) {
        showNotification("Lütfen e-posta ve şifrenizi giriniz.", "error");
        return;
    }

    try {
        // Önce giriş yapmayı dene
        await signInWithEmailAndPassword(auth, email, pass);
        showNotification("Başarıyla giriş yapıldı! Hoş geldiniz.", "success");
    } catch (err) {
        console.warn("Giriş başarısız, hesap aranıyor veya oluşturuluyor...", err.code);
        
        // Eğer kullanıcı sistemde yoksa otomatik kaydet (İsteğe bağlı pratik çözüm)
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                // Firestore dökümanını da hemen oluşturalım
                await loadUserData(userCredential.user);
                showNotification("Yeni hesabınız oluşturuldu ve giriş yapıldı! ✨", "success");
            } catch (createErr) {
                console.error("Kayıt oluşturma hatası:", createErr.message);
                showNotification("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.", "error");
            }
        } else {
            showNotification("Geçersiz e-posta veya şifre.", "error");
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

// Aktif seçili kur filtresi (Varsayılan: Tümü)
window.currentCurriculumCategory = window.currentCurriculumCategory || 'Tümü';

window.setCurriculumCategory = function(category) {
    window.currentCurriculumCategory = category;
    render();
}

// --- KADEMELİ MEDRESE MÜFREDAT KURLARI ---
const STATIC_CURRICULUM = [
    {
        level: 1,
        title: "1. Kur (Başlangıç Seviyesi)",
        description: "Temel medrese disiplini, günlük Kur'an okuması ve temel mütalaa.",
        tasks: [
            { id: 'k1_t1', title: "Kur'an-ı Kerim (Yüzünden Okuma / 1 Cüz)", category: "Kur'an" },
            { id: 'k1_t2', title: "Temel Ezber (Kısa Sureler / Dualar)", category: "Ezber" },
            { id: 'k1_t3', title: "Risale-i Nur Mütalaası (5 Sayfa)", category: "Mütalaa" },
            { id: 'k1_t4', title: "Osmanlıca Temel Metin Okuma", category: "Osmanlıca" }
        ]
    },
    {
        level: 2,
        title: "2. Kur (Orta Seviye)",
        description: "Arapça gramer başlangıcı ve ezber miktarının artırılması.",
        tasks: [
            { id: 'k2_t1', title: "Kur'an-ı Kerim (Tecvidli Okuma / 1 Cüz)", category: "Kur'an" },
            { id: 'k2_t2', title: "Hıfz / Sure Ezberi (Amme Cüzü)", category: "Ezber" },
            { id: 'k2_t3', title: "Risale-i Nur Mütalaası (10 Sayfa)", category: "Mütalaa" },
            { id: 'k2_t4', title: "Arapça Sarf (Emsile / Bina / Avamil)", category: "Mütalaa" },
            { id: 'k2_t5', title: "Osmanlıca Yazma Alıştırmaları", category: "Osmanlıca" }
        ]
    },
    {
        level: 3,
        title: "3. Kur (İleri Seviye)",
        description: "Arapça Nahiv, derinlemesine mütalaa ve hıfz tekrarı.",
        tasks: [
            { id: 'k3_t1', title: "Kur'an-ı Kerim Mukabele & Tefsir", category: "Kur'an" },
            { id: 'k3_t2', title: "Hıfz Tekrarı ve Yeni Sayfa Ezberi", category: "Ezber" },
            { id: 'k3_t3', title: "Arapça Nahiv (İzhari / Kafiye Mütalaası)", category: "Mütalaa" },
            { id: 'k3_t4', title: "Arapça Metin Çözümleme & Şerh Mütalaası", category: "Mütalaa" },
            { id: 'k3_t5', title: "Cevşen & Günlük Hususi Evrad", category: "Özel" }
        ]
    }
];

window.selectedCourseLevel = 1;

window.setCourseLevel = function(level) {
    window.selectedCourseLevel = level;
    render();
}

function renderCurriculumTab() {
    // Seçili kurun verisini çek
    const currentCourse = STATIC_CURRICULUM.find(c => c.level === window.selectedCourseLevel) || STATIC_CURRICULUM[0];

    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <!-- BAŞLIK VE KUR SEÇİMİ -->
            <div class="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-stone-100">📖 Medrese Kurları ve Müfredat</h2>
                    <p class="text-sm text-stone-400">Bulunduğunuz kuru seçerek vazifelerinizi günlük programınıza ekleyin.</p>
                </div>

                <!-- Kur Seçim Butonları -->
                <div class="flex items-center gap-2 bg-stone-900 p-1.5 rounded-xl border border-stone-800">
                    ${STATIC_CURRICULUM.map(course => `
                        <button onclick="setCourseLevel(${course.level})" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${window.selectedCourseLevel === course.level ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 shadow-lg shadow-emerald-950/50' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'}">
                            ${course.level}. Kur
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- SEÇİLİ KURUN DETAYLARI VE VAZİFE LİSTESİ -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <!-- Kur Özeti -->
                <div class="border-b border-stone-800/80 pb-4 flex justify-between items-start">
                    <div>
                        <span class="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg font-mono font-semibold">Seviye: ${currentCourse.level}. Kur</span>
                        <h3 class="text-xl font-bold text-stone-100 mt-2">${currentCourse.title}</h3>
                        <p class="text-xs text-stone-400 mt-1">${currentCourse.description}</p>
                    </div>
                </div>

                <!-- Kur İçi Vazifeler -->
                <div class="space-y-3">
                    <h4 class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Kur Dersleri & Vazifeleri</h4>
                    
                    ${currentCourse.tasks.map(item => {
    const isInMyTasks = state.tasks.some(t => t.curriculumId === item.id);
    return `
        <div class="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex justify-between items-center hover:border-stone-700 transition-colors">
            <div class="space-y-1">
                <h5 class="font-semibold text-stone-200 text-sm">${item.title}</h5>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 inline-block font-mono">
                    ${item.category}
                </span>
            </div>
            <button onclick="toggleTaskSelection('${item.id}')" class="px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${isInMyTasks ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}">
                ${isInMyTasks ? '✓ Programımda' : '+ Programıma Ekle'}
            </button>
        </div>
    `;
}).join('')}
                </div>
            </div>

            <!-- KİŞİSEL / ÖZEL VAZİFE EKLEME FORMU -->
            <div class="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-4">
                <div>
                    <h3 class="text-lg font-bold text-emerald-400">✨ Şahsi Ek Vazife Oluştur</h3>
                    <p class="text-xs text-stone-400">Kendi seviyenize göre eklemek istediğiniz hususi hedefleri buradan tanımlayabilirsiniz.</p>
                </div>
                <form onsubmit="addPersonalTask(event)" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" id="personal-task-title" placeholder="Kişisel Hedefiniz..." required class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-emerald-500">
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

window.toggleTaskSelection = async function(currId) {
    // Sabit müfredatın içinden ID'ye ait dersi buluyoruz
    let foundItem = null;
    for (const course of STATIC_CURRICULUM) {
        const match = course.tasks.find(t => t.id === currId);
        if (match) {
            foundItem = match;
            break;
        }
    }

    if (!foundItem) return;

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
                // Parçanın o gün çalışıldığını işaretlemek için tarih tutabiliriz
                lastProgressDate: today,
                completedAt: isFinished ? today : null
            };
        }
        return task;
    });

    await saveUserData();
    render();
}

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
        completed: false,
        completedAt: null,
        isPersonal: true
    });

    await saveUserData();
    showNotification("Özel vazifeniz programınıza eklendi! ✨", "success");
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
    if (confirm("Bu vazifeyi listeden kaldırmak istediğinize emin misiniz?")) {
        // Gelen id string veya number olabilir, güvenli eşleşme için sıkı olmayan karşılaştırma (==) kullanıyoruz
        state.tasks = state.tasks.filter(t => t.id != taskId);
        await saveUserData();
        showNotification("Vazife listeden kaldırıldı.", "info");
        render();
    }
}

setInterval(() => {
    if (state.user) {
        processDailyCheck().then(() => render());
    }
}, 60000);

render();
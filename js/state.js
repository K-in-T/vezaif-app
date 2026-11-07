import { db } from '../firebase-config.js';
const { doc, getDoc, setDoc, updateDoc } = window.firebaseModules;
// where ve query kaldırıldı, hata ihtimali tamamen ortadan kaldırıldı
const { collection, getDocs } = window.firebaseModules;

export let state = {
    user: null,
    role: 'normal',
    activeTab: 'dashboard',
    treeState: 'growing',
    treePhase: 'tohum1',
    streak: 0,
    consecutiveFailures: 0,
    lastCheckDate: null,
    referralCode: null,
    referredBy: null,
    tasks: [],
    completedHistory: [],
    journals: [],
    students: [],
    isLoadingStudents: false
};

// Rastgele harf ve sayılardan oluşan referans kodu üreteci
function generateReferralCode() {
    return 'MEDRESE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function loadStudents() {
    if (state.isLoadingStudents) return;
    
    // Sadece sorumlu kullanıcılar bu veriyi çekebilmeli
    if (state.role !== 'sorumlu') {
        state.students = [];
        return;
    }

    state.isLoadingStudents = true;

    try {
        const currentRefCode = state.referralCode;
        if (!currentRefCode) {
            state.students = [];
            state.isLoadingStudents = false;
            return;
        }

        // Tüm kullanıcıları çekip Javascript içinde sorumlunun koduyla (referredBy) eşleşenleri filtreliyoruz
        const querySnapshot = await getDocs(collection(db, "users"));
        
        state.students = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Kendisi haricinde ve sadece bu sorumlunun referans koduna sahip talebeleri listeye ekle
            if (docSnap.id !== state.user?.uid && data.referredBy === currentRefCode) {
                state.students.push({
                    id: docSnap.id,
                    ...data
                });
            }
        });
    } catch (error) {
        console.error("Talebe listesi çekilirken hata oluştu:", error.message);
        state.students = []; 
    } finally {
        state.isLoadingStudents = false;
    }
}

window.loadStudents = loadStudents;

export function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

export function showNotification(message, type = 'error') {
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

export async function saveUserData() {
    if (!state.user) return;
    try {
        const userDocRef = doc(db, "users", state.user.uid);
        await updateDoc(userDocRef, {
            streak: state.streak,
            consecutiveFailures: state.consecutiveFailures,
            treeState: state.treeState,
            treePhase: state.treePhase,
            lastCheckDate: state.lastCheckDate,
            referralCode: state.referralCode,
            referredBy: state.referredBy,
            tasks: state.tasks,
            completedHistory: state.completedHistory,
            journals: state.journals
        });
    } catch (error) {
        console.error("Veri kaydedilirken hata:", error);
    }
}

export async function loadUserData(userUid) {
    try {
        const userRef = doc(db, "users", userUid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            state.role = data.role || 'normal';
            state.treePhase = data.treePhase || 'tohum1';
            state.tasks = Array.isArray(data.tasks) ? data.tasks : [];
            state.completedHistory = Array.isArray(data.completedHistory) ? data.completedHistory : [];
            state.journals = Array.isArray(data.journals) ? data.journals : [];
            state.lastCheckDate = data.lastCheckDate || null;
            state.streak = data.streak || 0;
            state.referredBy = data.referredBy || null;

            // Eğer kullanıcı sorumlu ise ve veritabanında kodu yoksa yeni bir tane üretip kaydedelim
            if (state.role === 'sorumlu') {
                if (data.referralCode) {
                    state.referralCode = data.referralCode;
                } else {
                    state.referralCode = generateReferralCode();
                    await updateDoc(userRef, { referralCode: state.referralCode });
                }
            } else {
                state.referralCode = data.referralCode || null;
            }

        } else {
            // Yeni kullanıcı ilk defa oluşturuluyorsa (Kayıt ekranında zaten setDoc yapılıyor ama güvenlik amaçlı)
            const generatedCode = generateReferralCode();
            const defaultUserData = {
                email: state.user ? state.user.email : '',
                role: 'normal',
                treePhase: 'tohum1',
                referralCode: generatedCode,
                referredBy: null,
                tasks: [],
                completedHistory: [],
                journals: [],
                streak: 0,
                lastCheckDate: getTodayString(),
                createdAt: new Date().toISOString()
            };
            await setDoc(userRef, defaultUserData, { merge: true });
            state.role = defaultUserData.role;
            state.treePhase = defaultUserData.treePhase;
            state.referralCode = defaultUserData.referralCode;
            state.referredBy = defaultUserData.referredBy;
        }
    } catch (err) {
        console.error("Kullanıcı verisi yüklenemedi:", err);
    }
}
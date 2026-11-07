import { state } from './state.js';
import { auth, db } from '../firebase-config.js';

const { signOut } = window.firebaseModules;
const { doc, updateDoc } = window.firebaseModules;

// Sorumlular için rastgele referans kodu üreteci
function generateReferralCode() {
    return 'MEDRESE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function renderSettings() {
    // Eğer kullanıcı sorumlu ise ve henüz kodu yoksa otomatik oluşturalım
    if (state.userRole === 'sorumlu' && !state.referralCode) {
        state.referralCode = generateReferralCode();
        // İsteğe bağlı: Veritabanına hemen kaydedilebilir
        if (state.user) {
            updateDoc(doc(db, "users", state.user.uid), { referralCode: state.referralCode }).catch(console.error);
        }
    }

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">⚙️ Ayarlar ve Hesap</h2>
                    <p class="text-xs text-slate-500 font-medium">Oturum bilgilerinizi, rehberliği ve hesap ayarlarınızı yönetin.</p>
                </div>
            </div>

            <!-- UYGULAMA REHBERİ KUTUCUĞU -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 border-b-4 border-b-amber-400 rounded-3xl p-6 space-y-4 shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-sm shrink-0">
                        🧭
                    </div>
                    <div>
                        <h3 class="text-base font-black text-amber-950">Medrese Asistanı Kullanım Rehberi</h3>
                        <p class="text-xs text-amber-800 font-medium">Uygulamayı hızlıca keşfetmek için kısa adımlar:</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div class="bg-white/90 border-2 border-amber-200 rounded-2xl p-4 space-y-1 shadow-sm">
                        <div class="text-xs font-black text-amber-900 flex items-center gap-1.5">
                            <span>📋</span> Bitki Sekmesi / Vazife Sayfası
                        </div>
                        <p class="text-[11px] text-slate-600 font-medium">
                            Bitki sayfasında günlük vazifelerini görebilir ve tamamlayabilirsin. 00:00 saatinde 
                            vazifeler kontrol edilir. Eğer Yazı, Kur'an ve Mütalaa vazifelerinden birer tane yapılmışsa 
                            istikrar serisi muhafaza edilir. Ek vazife yapılmışsa seri artar. Vazifelerden biri 
                            aksatılırsa seri sıfırlanır. 10 Faz, 10 Kuru temsil eder. 
                        </p>
                    </div>

                    <div class="bg-white/90 border-2 border-amber-200 rounded-2xl p-4 space-y-1 shadow-sm">
                        <div class="text-xs font-black text-amber-900 flex items-center gap-1.5">
                            <span>📖</span> Kur Listesi (Müfredat)
                        </div>
                        <p class="text-[11px] text-slate-600 font-medium">
                            Müfredat sekmesinden kur programlarını inceleyebilir ve vazifeleri programına ekleyebilirsin.
                            Müfredat sayfasının en altından kendi özel vazifelerini tanımlayabilir ve kategorilerini seçebilirsin.
                        </p>
                    </div>
                </div>
            </div>

            <!-- EĞER KULLANICI SORUMLU İSE REFERANS KODUNU GÖSTER -->
            ${state.role === 'sorumlu' ? `
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                    <h3 class="text-lg font-black text-slate-800">👥 Lokal Ağ Referans Kodu</h3>
                    <div class="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-2">
                        <h4 class="text-xs font-black text-emerald-900 uppercase">Referans Kodunuz</h4>
                        <p class="text-xs text-emerald-700">Talebelerinizin kayıt esnasında size bağlanabilmesi için bu kodu onlarla paylaşın:</p>
                        <div class="flex items-center gap-2">
                            <input type="text" readonly value="${state.referralCode || 'Kod Üretiliyor...'}" class="bg-white border-2 border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-900 flex-1 outline-none">
                            <button onclick="navigator.clipboard.writeText('${state.referralCode}'); showNotification('Kod kopyalandı!', 'success');" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl border-b-2 border-emerald-700">
                                Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- OTURUM BİLGİLERİ VE ÇIKIŞ YAP -->
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
                        🔑 Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.handleLogout = async function() {
    if (confirm("Çıkış yapmak istiyor musunuz?")) {
        await signOut(auth);
        window.location.reload();
    }
};
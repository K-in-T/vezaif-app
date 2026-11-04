import { state } from './state.js';
import { auth } from '../firebase-config.js';
const { signOut } = window.firebaseModules;

export function renderSettings() {
    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">⚙️ Ayarlar ve Hesap</h2>
                    <p class="text-xs text-slate-500 font-medium">Oturum bilgilerinizi yönetin.</p>
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
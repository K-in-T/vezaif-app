import { state } from './state.js';

window.statsPeriod = window.statsPeriod || 'genel';

window.setStatsPeriod = function(period) {
    window.statsPeriod = period;
    window.render();
};

export function renderAwards() {
    const activeCompleted = state.tasks.filter(t => t.completed);
    const historyCompleted = state.completedHistory || [];
    
    // 1. GENEL VERİLER (İlerleme Çubukları İçin - Sabit Toplam Veri)
    const allCompleted = [...activeCompleted, ...historyCompleted];

    // 2. FİLTRELENMİŞ VERİLER (Geçmiş Vazifeler Kutusu İçin)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const filteredCompleted = allCompleted.filter(t => {
        const completedDateStr = t.completedAt || todayStr;
        const taskDate = new Date(completedDateStr);

        if (window.statsPeriod === 'gunluk') {
            return completedDateStr === todayStr;
        } else if (window.statsPeriod === 'haftalik') {
            const diffTime = now - taskDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        } else if (window.statsPeriod === 'aylik') {
            return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
        }
        return true; // 'genel'
    });

    // 10 Kur müfredatındaki hedef vazife sayıları
    const maxTargets = {
        "Kur'an": 10,
        "Mütalaa": 10,
        "Yazı": 10,
        "Ezber": 10,
        "Özel": 10
    };

    // İlerleme Çubukları (Genel verilere göre hesaplanır)
    const categories = ["Kur'an", "Mütalaa", "Yazı", "Ezber", "Özel"];
    const categoryStats = categories.map(cat => {
        const catCompleted = allCompleted.filter(t => 
            t.category === cat || 
            (cat === 'Mütalaa' && (t.category === 'Arapça')) || 
            (cat === 'Yazı' && (t.category === 'Osmanlıca'))
        ).length;

        const target = maxTargets[cat] || 10;
        const percent = Math.min(Math.round((catCompleted / target) * 100), 100);

        return { category: cat, completed: catCompleted, target, percent };
    });

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <!-- SADELEŞTİRİLMİŞ ÜST BAŞLIK -->
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">📊 Ders ve Alan İlerlemesi</h2>
                    <p class="text-xs text-slate-500 font-medium">Genel müfredat ilerlemenizi ve zaman filtreli tamamlanan vazifelerinizi inceleyin.</p>
                </div>
                <div class="p-3 bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 rounded-2xl text-emerald-700 text-xl shadow-sm">
                    📈
                </div>
            </div>

            <!-- DERS / ALAN BAZLI GENEL İLERLEME ÇUBUKLARI (GENELİ ESAS ALIR) -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 class="text-lg font-black text-slate-800">📈 Genel Alan İlerlemesi (10 Kur Hedefi)</h3>
                
                <div class="space-y-5">
                    ${categoryStats.map(stat => `
                        <div class="space-y-2">
                            <div class="flex justify-between items-center text-xs font-black">
                                <span class="text-slate-700">${stat.category}</span>
                                <span class="text-emerald-700">${stat.completed} / ${stat.target} Tamamlandı (%${stat.percent})</span>
                            </div>
                            
                            <!-- Genel İlerleme Çubuğu -->
                            <div class="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5 border-2 border-stone-200 shadow-inner">
                                <div class="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm" style="width: ${stat.percent}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- GEÇMİŞ TAMAMLANAN VAZİFELER KUTUSU (FİLTRELER BURADA) -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div class="flex flex-wrap justify-between items-center gap-4 border-b border-stone-200 pb-4">
                    <h3 class="text-lg font-black text-slate-800">📅 Tamamlanan Geçmiş Vazifeler</h3>
                    
                    <!-- ZAMAN DİLİMİ FİLTRELERİ -->
                    <div class="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border-2 border-stone-200">
                        <button onclick="setStatsPeriod('gunluk')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'gunluk' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Günlük</button>
                        <button onclick="setStatsPeriod('haftalik')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'haftalik' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Haftalık</button>
                        <button onclick="setStatsPeriod('aylik')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'aylik' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Aylık</button>
                        <button onclick="setStatsPeriod('genel')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'genel' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Genel</button>
                    </div>
                </div>

                ${filteredCompleted.length > 0 ? `
                    <div class="space-y-3">
                        ${filteredCompleted.map(t => `
                            <div class="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="text-emerald-600 text-lg font-bold">✅</span>
                                    <div>
                                        <p class="text-sm font-bold text-slate-800">${t.title}</p>
                                        <p class="text-xs text-slate-400 font-medium">Alan: ${t.category}</p>
                                    </div>
                                </div>
                                <span class="px-3 py-1 bg-white text-emerald-700 border-2 border-emerald-200 rounded-xl text-xs font-mono font-black shadow-sm">
                                    🗓️ ${t.completedAt || 'Bugün'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-center py-8 text-slate-400 text-xs font-medium">Bu periyotta tamamlanan vazife bulunmuyor.</p>'}
            </div>
        </div>
    `;
}
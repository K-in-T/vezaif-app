import { state } from './state.js';

window.historyCategoryFilter = window.historyCategoryFilter || 'hepsi';
window.historyDateFilter = window.historyDateFilter || ''; // YYYY-MM-DD seçili tarih
window.historyStatusFilter = window.historyStatusFilter || 'hepsi'; // 'hepsi', 'tamamlandi', 'tamamlanmadi'

window.setHistoryCategoryFilter = function(category) {
    window.historyCategoryFilter = category;
    window.render();
};

window.setHistoryDateFilter = function(dateStr) {
    window.historyDateFilter = dateStr;
    window.render();
};

window.setHistoryStatusFilter = function(status) {
    window.historyStatusFilter = status;
    window.render();
};

export function renderAwards() {
    const historyCompleted = state.completedHistory || [];
    
    // Tüm kategorilerdeki tamamlanan vazifelerin tekrar sayılarını hesapla
    const taskCompletionCounts = {};
    historyCompleted.forEach(t => {
        const key = t.curriculumId || t.title;
        if (t.completed) {
            taskCompletionCounts[key] = (taskCompletionCounts[key] || 0) + 1;
        }
    });

    const CATEGORIES = [
        "Tümü",
        "Kur'ân-ı Kerim",
        "Risale-i Nur Mütalaası",
        "Ezber Çalışması",
        "Yazı Çalışması",
        "Okunacak Kitaplar",
        "Mütalaa Verme Çalışması",
        "Özel"
    ];

    // FİLTRELEME MANTIĞI: Kategori, Tarih ve Durum
    const filteredCompleted = historyCompleted.filter(t => {
        const completedDateStr = t.completedAt || '';

        // 1. Durum Filtresi (Hepsi / Tamamlandı / Tamamlanmadı)
        const statusFilter = window.historyStatusFilter || 'hepsi';
        if (statusFilter === 'tamamlandi' && !t.completed) return false;
        if (statusFilter === 'tamamlanmadi' && t.completed) return false;

        // 2. Kategori Filtresi
        const selectedCat = window.historyCategoryFilter || 'hepsi';
        if (selectedCat !== 'hepsi' && selectedCat !== 'Tümü') {
            if (t.category !== selectedCat) return false;
        }

        // 3. Tarih Filtresi (Takvimden spesifik bir gün seçilmişse)
        const selectedDate = window.historyDateFilter;
        if (selectedDate && selectedDate !== '') {
            if (completedDateStr !== selectedDate) return false;
        }

        return true; 
    });

    const maxTargets = {
        "Kur'an": 10,
        "Mütalaa": 10,
        "Yazı": 10,
        "Ezber": 10,
        "Özel": 10
    };

    const categoriesList = ["Kur'an", "Mütalaa", "Yazı", "Ezber", "Özel"];
    const categoryStats = categoriesList.map(cat => {
        const catCompleted = historyCompleted.filter(t => 
            t.completed && (
                t.category === cat || 
                (cat === 'Mütalaa' && (t.category === 'Arapça' || t.category.toLowerCase().includes('mütalaa'))) || 
                (cat === 'Yazı' && (t.category === 'Osmanlıca'))
            )
        ).length;

        const target = maxTargets[cat] || 10;
        const percent = Math.min(Math.round((catCompleted / target) * 100), 100);

        return { category: cat, completed: catCompleted, target, percent };
    });

    const currentCatFilter = window.historyCategoryFilter || 'hepsi';
    const currentStatusFilter = window.historyStatusFilter || 'hepsi';
    const currentDateFilter = window.historyDateFilter || '';

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">📊 Kur ve Vazife İlerlemesi</h2>
                    <p class="text-xs text-slate-500 font-medium">Kategoriye ve tarihe göre filtrelenmiş geçmiş vazife kayıtlarınızı inceleyin.</p>
                </div>
            </div>

            <!-- KURLARDA İLERLEME -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 class="text-lg font-black text-slate-800">📈 Kurlarda İlerleme</h3>
                
                <div class="space-y-5">
                    ${categoryStats.map(stat => `
                        <div class="space-y-2">
                            <div class="flex justify-between items-center text-xs font-black">
                                <span class="text-slate-700">${stat.category}</span>
                                <span class="text-emerald-700">${stat.completed} / ${stat.target} Tamamlandı (%${stat.percent})</span>
                            </div>
                            
                            <div class="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5 border-2 border-stone-200 shadow-inner">
                                <div class="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm" style="width: ${stat.percent}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- GEÇMİŞ VAZİFELER VE YENİ FİLTRELEME ALANI -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div class="flex flex-col gap-4 border-b border-stone-200 pb-4">
                    <h3 class="text-lg font-black text-slate-800">📅 Geçmiş Vazifeler Arşivi</h3>
                    
                    <!-- FİLTRELEME SEÇENEKLERİ -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl border-2 border-stone-200">
                        
                        <!-- 1. KATEGORİ SEÇİMİ -->
                        <div>
                            <label class="block text-[10px] font-black uppercase text-slate-500 mb-1">Kategori Filtresi</label>
                            <select onchange="setHistoryCategoryFilter(this.value)" class="w-full bg-white border-2 border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500">
                                ${CATEGORIES.map(cat => `
                                    <option value="${cat === 'Tümü' ? 'hepsi' : cat}" ${(currentCatFilter === cat || (cat === 'Tümü' && currentCatFilter === 'hepsi')) ? 'selected' : ''}>
                                        ${cat}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- 2. TARİH SEÇİMİ -->
                        <div>
                            <label class="block text-[10px] font-black uppercase text-slate-500 mb-1">Tarih Filtresi</label>
                            <div class="flex items-center gap-1">
                                <input type="date" value="${currentDateFilter}" onchange="setHistoryDateFilter(this.value)" class="flex-1 bg-white border-2 border-stone-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500">
                                ${currentDateFilter ? `
                                    <button onclick="setHistoryDateFilter('')" class="px-2 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-xs font-black text-slate-600" title="Tarihi Temizle">✕</button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- 3. DURUM SEÇİMİ -->
                        <div>
                            <label class="block text-[10px] font-black uppercase text-slate-500 mb-1">Durum Filtresi</label>
                            <select onchange="setHistoryStatusFilter(this.value)" class="w-full bg-white border-2 border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500">
                                <option value="hepsi" ${currentStatusFilter === 'hepsi' ? 'selected' : ''}>Tüm Vazifeler</option>
                                <option value="tamamlandi" ${currentStatusFilter === 'tamamlandi' ? 'selected' : ''}>Tamamlananlar ✅</option>
                                <option value="tamamlanmadi" ${currentStatusFilter === 'tamamlanmadi' ? 'selected' : ''}>Tamamlanmayanlar ❌</option>
                            </select>
                        </div>

                    </div>
                </div>

                <!-- LİSTELEME ALANI -->
                ${filteredCompleted.length > 0 ? `
                    <div class="space-y-3 pt-2">
                        ${filteredCompleted.map(t => {
                            const key = t.curriculumId || t.title;
                            const count = taskCompletionCounts[key] || 1;
                            const isDone = t.completed;

                            return `
                                <div class="p-4 ${isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'} border-2 rounded-2xl flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <span class="text-lg font-bold">${isDone ? '✅' : '❌'}</span>
                                        <div>
                                            <p class="text-sm font-bold text-slate-800">${t.title}</p>
                                            <div class="flex items-center gap-2 mt-0.5">
                                                <span class="text-xs text-slate-400 font-medium">${t.category}</span>
                                                <span class="px-2 py-0.5 ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} rounded-lg text-[10px] font-black">
                                                    ${isDone ? 'Tamamlandı' : 'Tamamlanmadı'}
                                                </span>
                                                ${isDone && count > 1 ? `
                                                    <span class="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-black">
                                                        🔄 ${count}. Defa
                                                    </span>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <span class="px-3 py-1 bg-white text-slate-700 border-2 border-stone-200 rounded-xl text-xs font-mono font-black shadow-sm">
                                        🗓️ ${t.completedAt || 'Belirtilmedi'}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<p class="text-center py-8 text-slate-400 text-xs font-medium">Seçtiğiniz kategori ve tarih filtrelerine uygun geçmiş vazife kaydı bulunmuyor.</p>'}
            </div>
        </div>
    `;
}
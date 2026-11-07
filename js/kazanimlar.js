import { state } from './state.js';

window.statsPeriod = window.statsPeriod || 'genel';

window.setStatsPeriod = function(period) {
    window.statsPeriod = period;
    window.render();
};

// Sadece Ezber, Mütalaa ve Mütalaa Verme (Şehadetname) alanlarında tekrar kontrolü yapan yardımcı fonksiyon
function isReviewableCategory(category) {
    if (!category) return false;
    const catLower = category.toLowerCase();
    return catLower.includes('ezber') || catLower.includes('mütalaa') || catLower.includes('mütalaa verme') || catLower.includes('şehadetname');
}

export function renderAwards() {
    const activeCompleted = state.tasks.filter(t => t.completed);
    const historyCompleted = state.completedHistory || [];
    
    // Tüm tamamlananlar
    const allCompleted = [...activeCompleted, ...historyCompleted];

    // Aynı id veya başlığa sahip tekrar edilen vazifelerin sayısını (reviewCount) hesaplayalım
    const taskCompletionCounts = {};
    allCompleted.forEach(t => {
        const key = t.curriculumId || t.title;
        if (isReviewableCategory(t.category)) {
            taskCompletionCounts[key] = (taskCompletionCounts[key] || 0) + 1;
        }
    });

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
        return true; 
    });

    const maxTargets = {
        "Kur'an": 10,
        "Mütalaa": 10,
        "Yazı": 10,
        "Ezber": 10,
        "Özel": 10
    };

    const categories = ["Kur'an", "Mütalaa", "Yazı", "Ezber", "Özel"];
    const categoryStats = categories.map(cat => {
        const catCompleted = allCompleted.filter(t => 
            t.category === cat || 
            (cat === 'Mütalaa' && (t.category === 'Arapça' || t.category.toLowerCase().includes('mütalaa'))) || 
            (cat === 'Yazı' && (t.category === 'Osmanlıca'))
        ).length;

        const target = maxTargets[cat] || 10;
        const percent = Math.min(Math.round((catCompleted / target) * 100), 100);

        return { category: cat, completed: catCompleted, target, percent };
    });

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">📊 Kur ve Vazife İlerlemesi</h2>
                    <p class="text-xs text-slate-500 font-medium">Birikimlerinizi analiz edin. Unuttuğunuz bilgileri tazeleyin.</p>
                </div>
            </div>

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

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div class="flex flex-wrap justify-between items-center gap-4 border-b border-stone-200 pb-4">
                    <h3 class="text-lg font-black text-slate-800">📅 Tamamlanan Geçmiş Vazifeler ve Tekrarlar</h3>
                    
                    <div class="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border-2 border-stone-200">
                        <button onclick="setStatsPeriod('gunluk')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'gunluk' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Günlük</button>
                        <button onclick="setStatsPeriod('haftalik')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'haftalik' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Haftalık</button>
                        <button onclick="setStatsPeriod('aylik')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'aylik' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Aylık</button>
                        <button onclick="setStatsPeriod('genel')" class="px-3 py-1 rounded-xl text-xs font-black transition-all ${window.statsPeriod === 'genel' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Genel</button>
                    </div>
                </div>

                ${filteredCompleted.length > 0 ? `
                    <div class="space-y-3">
                        ${filteredCompleted.map(t => {
                            const key = t.curriculumId || t.title;
                            const count = taskCompletionCounts[key] || 1;
                            const isReviewable = isReviewableCategory(t.category);

                            return `
                                <div class="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <span class="text-emerald-600 text-lg font-bold">✅</span>
                                        <div>
                                            <p class="text-sm font-bold text-slate-800">${t.title}</p>
                                            <div class="flex items-center gap-2 mt-0.5">
                                                <span class="text-xs text-slate-400 font-medium">Alan: ${t.category}</span>
                                                ${isReviewable && count > 1 ? `
                                                    <span class="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-black">
                                                        🔄 ${count}. Defa Tekrarlandı
                                                    </span>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <span class="px-3 py-1 bg-white text-emerald-700 border-2 border-emerald-200 rounded-xl text-xs font-mono font-black shadow-sm">
                                        🗓️ ${t.completedAt || 'Bugün'}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<p class="text-center py-8 text-slate-400 text-xs font-medium">Bu periyotta tamamlanan vazife bulunmuyor.</p>'}
            </div>
        </div>
    `;
}
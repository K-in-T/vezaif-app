import { state, saveUserData, showNotification } from './state.js';

window.journalSearchQuery = window.journalSearchQuery || '';

window.filterJournals = function(query) {
    window.journalSearchQuery = query.toLowerCase();
    const listContainer = document.getElementById('journal-list-container');
    if (listContainer) listContainer.innerHTML = renderJournalListHTML();
};

function renderJournalListHTML() {
    if (!state.journals) state.journals = [];

    const filtered = state.journals.filter(e => 
        e.content.toLowerCase().includes(window.journalSearchQuery) || 
        e.date.toLowerCase().includes(window.journalSearchQuery)
    );

    if (filtered.length === 0) {
        return `<div class="text-center py-8 text-xs text-slate-400">Aranan kritere uygun günlük kaydı bulunamadı.</div>`;
    }

    return filtered.map(entry => {
        const realIndex = state.journals.indexOf(entry);
        return `
            <div class="p-5 bg-stone-50 border-2 border-stone-200 rounded-2xl space-y-2 relative">
                <div class="flex justify-between items-center border-b border-stone-200 pb-2">
                    <span class="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full font-mono">${entry.date}</span>
                    <button onclick="deleteJournalEntry(${realIndex})" class="text-stone-400 hover:text-rose-600 text-xs font-black p-1">🗑️</button>
                </div>
                <p class="text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed">${entry.content}</p>
            </div>
        `;
    }).join('');
}

export function renderJournalTab() {
    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 shadow-sm">
                <h2 class="text-xl font-black text-slate-800">✒️ Günlük & Vakit Analizi</h2>
                <p class="text-xs text-slate-500 font-medium">Gününü nasıl geçirdin? Vaktini tefekkür et, muhasebeni yap.</p>
            </div>

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <h3 class="text-lg font-black text-slate-800">📝 Bugünkü Vakit Muhasebesi</h3>
                <form onsubmit="saveJournalEntry(event)" class="space-y-4">
                    <textarea id="journal-content" rows="4" placeholder="Bugün vakti nasıl değerlendirdim..." required class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500"></textarea>
                    <div class="flex justify-end">
                        <button type="submit" class="px-6 py-3 bg-emerald-500 text-white font-black border-b-4 border-b-emerald-700 rounded-2xl text-sm">Günlüğü Kaydet</button>
                    </div>
                </form>
            </div>

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-stone-200 pb-4">
                    <h3 class="text-lg font-black text-slate-800">📚 Geçmiş Vakit Analizlerim</h3>
                    <div class="w-full md:w-72">
                        <input type="text" id="journal-search-input" oninput="filterJournals(this.value)" value="${window.journalSearchQuery || ''}" placeholder="🔍 Günlüklerde ara..." class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div id="journal-list-container" class="space-y-4">
                    ${renderJournalListHTML()}
                </div>
            </div>
        </div>
    `;
}

window.saveJournalEntry = async function(e) {
    e.preventDefault();
    const textarea = document.getElementById('journal-content');
    if (!textarea || !textarea.value.trim()) return;

    const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    if (!state.journals) state.journals = [];
    state.journals.unshift({ date: dateStr, content: textarea.value.trim(), timestamp: Date.now() });

    await saveUserData();
    showNotification("Vakit analizi kaydedildi! ✒️", "success");
    window.render();
};

window.deleteJournalEntry = async function(index) {
    if (confirm("Bu kaydı silmek istiyor musunuz?")) {
        state.journals.splice(index, 1);
        await saveUserData();
        window.render();
    }
};
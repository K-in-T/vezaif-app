import { state } from './state.js';

export function renderSupervisor() {
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
                    const studentHistory = s.completedHistory || [];
                    const completedTasks = [...studentTasks.filter(t => t.completed), ...studentHistory];
                    
                    return `
                        <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl overflow-hidden shadow-sm transition-all">
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

                            ${isExpanded ? `
                                <div class="p-6 bg-stone-50 border-t-2 border-stone-200 space-y-4 animate-fadeIn">
                                    <h5 class="text-xs font-black text-slate-700 uppercase tracking-wider">📚 Tamamlanan Son Vazifeler</h5>
                                    
                                    ${completedTasks.length > 0 ? `
                                        <div class="space-y-2.5">
                                            ${completedTasks.map(t => `
                                                <div class="p-3.5 bg-white border-2 border-stone-200 rounded-2xl flex items-center justify-between shadow-sm">
                                                    <div class="space-y-0.5">
                                                        <div class="flex items-center gap-2">
                                                            <span class="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">${t.category}</span>
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
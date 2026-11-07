import { state, saveUserData, getTodayString, showNotification } from './state.js';
import { db } from '../firebase-config.js';

const { doc, updateDoc } = window.firebaseModules;
const BASE_PHASES = ['tohum1', 'tohum2', 'filiz1', 'filiz2', 'fide1', 'fide2', 'cicek1', 'cicek2', 'meyve1', 'meyve2'];

const CATEGORY_OPTIONS = [
    "Kur'ân-ı Kerim",
    "Risale-i Nur Mütalaası",
    "Ezber Çalışması",
    "Yazı Çalışması",
    "Okunacak Kitaplar",
    "Mütalaa Verme Çalışması",
    "Özel"
];

function getPhaseLevelIndex(phase) {
    if (!phase) return 0;
    const index = BASE_PHASES.indexOf(phase);
    return index !== -1 ? index : 0;
}

function getPhaseString(index) {
    if (index < 0) index = 0;
    if (index < BASE_PHASES.length) return BASE_PHASES[index];
    return `meyve${(index - BASE_PHASES.length) + 1}`;
}

export function getTreePhaseDisplay(phase) {
    if (!phase) phase = 'tohum1';
    if (phase.startsWith('tohum')) {
        const sub = phase.replace('tohum', '');
        return { icon: '🌰', title: `Tohum Fazı ${sub}`, desc: 'İlim yolculuğunun ilk adımları, toprak altındaki hazırlık.', kur: sub === '1' ? '1. Kur' : '2. Kur' };
    } else if (phase.startsWith('filiz')) {
        const sub = phase.replace('filiz', '');
        return { icon: '🌱', title: `Filiz Fazı ${sub}`, desc: 'İstikrarla birlikte ilim fidanı topraktan baş gösteriyor.', kur: sub === '1' ? '3. Kur' : '4. Kur' };
    } else if (phase.startsWith('fide')) {
        const sub = phase.replace('fide', '');
        return { icon: '🌿', title: `Fide Fazı ${sub}`, desc: 'Kökler sağlamlaşıyor, fidan boy atmaya başladı.', kur: sub === '1' ? '5. Kur' : '6. Kur' };
    } else if (phase.startsWith('cicek')) {
        const sub = phase.replace('cicek', '');
        return { icon: '🌸', title: `Çiçek Fazı ${sub}`, desc: 'Gayretler meyve vermeye başladı, manevi manzaralar açılıyor.', kur: sub === '1' ? '7. Kur' : '8. Kur' };
    } else if (phase.startsWith('meyve')) {
        const sub = phase.replace('meyve', '');
        return { icon: '🍎', title: `Meyve Fazı ${sub}`, desc: 'Zirve ilim ve olgunluk dönemi, istikrarın en güzel meyvesi.', kur: sub === '1' ? '9. Kur' : '10. Kur' };
    }
    return { icon: '🌳', title: 'İlim Ağacı', desc: 'Gelişimi sürdürün.', kur: '1. Kur' };
}

export async function processDailyCheck() {
    const today = getTodayString();
    if (state.lastCheckDate && state.lastCheckDate !== today) {
        const tasks = state.tasks || [];
        const completedTasks = tasks.filter(t => t.completed);
        
        const hasKuran = completedTasks.some(t => t.category === "Kur'an" || t.category === "Kur'ân-ı Kerim");
        const hasMutalaa = completedTasks.some(t => t.category === "Mütalaa" || t.category === "Risale-i Nur Mütalaası" || t.category === "Arapça");
        const hasYazi = completedTasks.some(t => t.category === "Yazı" || t.category === "Yazı Çalışması" || t.category === "Osmanlıca");
        
        const coreCategoriesMet = hasKuran && hasMutalaa && hasYazi;
        const hasExtraTask = completedTasks.length > 3 || completedTasks.some(t => t.isPersonal || t.category === "Ezber" || t.category === "Ezber Çalışması" || t.category === "Özel");

        let currentIndex = getPhaseLevelIndex(state.treePhase || 'tohum1');

        if (coreCategoriesMet) {
            if (hasExtraTask) {
                state.streak = (state.streak || 0) + 1;
                currentIndex++;
            }
        } else {
            state.streak = 0;
            currentIndex = 0;
        }

        state.treePhase = getPhaseString(currentIndex);
        
        if (!state.completedHistory) state.completedHistory = [];
        completedTasks.forEach(task => {
            state.completedHistory.push({ ...task, completedAt: state.lastCheckDate || today });
        });

        state.tasks = tasks.filter(t => !t.completed);
        state.lastCheckDate = today;
        await saveUserData();
    }
}

export function renderDashboard() {
    const treeInfo = getTreePhaseDisplay(state.treePhase || 'tohum1');

    const activeTasks = (state.tasks || []).filter(task => {
        const isDeletedInArray = state.deletedTaskIds && state.deletedTaskIds.includes(task.id);
        return !isDeletedInArray;
    });

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                
                <div class="flex items-center gap-4 w-full md:w-auto">
                    <div class="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 flex items-center justify-center text-3xl shadow-sm shrink-0">
                        ${treeInfo.icon}
                    </div>
                    <div>
                        <h3 class="text-base font-black text-slate-800 mt-0.5">${treeInfo.title}</h3>
                        <p class="text-[11px] text-slate-500 font-medium">${treeInfo.desc}</p>
                    </div>
                </div>

                <div class="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    <div class="bg-amber-50 border-2 border-amber-200 border-b-3 border-b-amber-300 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-sm">
                        <span class="text-xl">🔥</span>
                        <div>
                            <div class="text-[9px] font-extrabold uppercase text-amber-700 leading-none">Seri:</div>
                            <div class="text-sm font-black text-amber-600 leading-none mt-1">${state.streak || 0} Gün</div>
                        </div>
                    </div>

                    <button onclick="togglePhaseModal()" class="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border-2 border-sky-200 border-b-3 border-b-sky-300 flex items-center justify-center text-sm font-black transition-all shadow-sm active:translate-y-0.5 shrink-0" title="Faz Aşamaları">
                        ℹ️
                    </button>
                </div>

            </div>

            ${window.showPhaseModal ? `
                <div class="bg-sky-50 border-2 border-sky-300 border-b-4 border-b-sky-400 rounded-3xl p-6 space-y-3 text-xs text-sky-900 animate-fadeIn shadow-sm">
                    <div class="flex justify-between items-center font-black border-b-2 border-sky-200 pb-2">
                        <span class="text-sm">🌳 İlim Ağacı Faz Basamakları (10 Kur - 2'şer Seviye)</span>
                    </div>
                    <ul class="space-y-2 pl-4 list-disc font-medium">
                        <li><strong>Tohum Fazı (1, 2):</strong> 1. ve 2. Kur hazırlık evreleri.</li>
                        <li><strong>Filiz Fazı (1, 2):</strong> 3. ve 4. Kur topraktan baş gösterme evreleri.</li>
                        <li><strong>Fide Fazı (1, 2):</strong> 5. ve 6. Kur kökleşme ve boy atma evreleri.</li>
                        <li><strong>Çiçek Fazı (1, 2):</strong> 7. ve 8. Kur manevi çiçek açma evreleri.</li>
                        <li><strong>Meyve Fazı (1, 2):</strong> 9. ve 10. Kur zirve ilim ve olgunluk evreleri.</li>
                    </ul>
                </div>
            ` : ''}

            <!-- GÜNÜN VAZİFELERİ LİSTESİ -->
            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-black text-slate-800">📋 Günün Vazifeleri</h3>
                        <p class="text-xs text-slate-500 font-medium">"İki günü eşit olan ziyandadır."</p>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <button onclick="switchTab('müfredat')" class="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-500 border-b-4 border-b-amber-600 rounded-2xl text-xs font-black transition-all active:translate-y-0.5 shadow-sm flex items-center gap-1.5">
                            <span>📖</span> Kur Listesi
                        </button>
                    </div>
                </div>

                <div class="space-y-3.5">
                    ${activeTasks.length > 0 ? activeTasks.map(task => {
                        const isCustom = String(task.id).startsWith('custom_');
                        return `
                            <div class="p-4 md:p-5 rounded-2xl ${task.completed ? 'bg-emerald-50/80 border-2 border-emerald-300 border-b-4 border-b-emerald-400' : 'bg-stone-50 border-2 border-stone-200 border-b-4 border-b-stone-300'} transition-all flex items-center justify-between gap-4">
                                <div class="flex items-center gap-4">
                                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete('${task.id}')" class="w-6 h-6 accent-emerald-500 cursor-pointer">
                                    <div>
                                        <h4 class="font-bold text-sm text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}">${task.title}</h4>
                                        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-stone-200 text-stone-700">${task.category}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1">
                                    ${isCustom ? `<button onclick="openEditTaskModal('${task.id}')" class="text-stone-400 hover:text-sky-600 text-xs font-black p-1.5" title="Düzenle">✏️</button>` : ''}
                                    <button onclick="deleteTask('${task.id}')" class="text-stone-400 hover:text-rose-600 text-xs font-black p-1.5" title="Sil">🗑️</button>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p class="text-center py-6 text-slate-400 text-xs">Vazife bulunmuyor. Kur listesinden ekleyebilirsiniz.</p>'}
                </div>
            </div>
        </div>

        <!-- VAZİFE DÜZENLEME MODALI -->
        ${window.editingTask ? `
            <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-xl">
                    <div class="flex justify-between items-center border-b-2 border-stone-100 pb-3">
                        <h4 class="text-sm font-black text-slate-800">✏️ Vazifeyi Düzenle</h4>
                        <button onclick="closeEditTaskModal()" class="text-stone-400 hover:text-rose-600 font-black text-sm">✕</button>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-[10px] font-black uppercase text-stone-500 mb-1">Vazife Başlığı</label>
                            <input type="text" id="edit-task-title" value="${window.editingTask.title}" class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black uppercase text-stone-500 mb-1">Kategori / Alan</label>
                            <select id="edit-task-category" class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-emerald-500">
                                ${CATEGORY_OPTIONS.map(cat => `<option value="${cat}" ${window.editingTask.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button onclick="saveEditedTask()" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-xs border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm active:translate-y-0.5 transition-all">
                            Kaydet
                        </button>
                        <button onclick="closeEditTaskModal()" class="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black rounded-2xl text-xs border-2 border-stone-200 border-b-4 border-b-stone-300">
                            İptal
                        </button>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

window.togglePhaseModal = function() {
    window.showPhaseModal = !window.showPhaseModal;
    window.render();
};

window.toggleTaskComplete = async function(taskId) {
    if (!taskId) return;
    const todayStr = getTodayString();

    state.tasks = state.tasks.map(t => {
        if (String(t.id) === String(taskId)) {
            const nextCompleted = !t.completed;
            return { 
                ...t, 
                completed: nextCompleted, 
                completedAt: nextCompleted ? todayStr : null 
            };
        }
        return t;
    });

    await saveUserData();
    window.render();
};

window.deleteTask = async function(taskId) {
    if (!taskId) return;

    state.tasks = (state.tasks || []).filter(t => String(t.id) !== String(taskId));

    if (!String(taskId).startsWith('custom_')) {
        if (!state.deletedTaskIds) state.deletedTaskIds = [];
        if (!state.deletedTaskIds.includes(taskId)) {
            state.deletedTaskIds.push(taskId);
        }
    }

    try {
        if (state.user) {
            const userRef = doc(db, "users", state.user.uid);
            await updateDoc(userRef, {
                tasks: state.tasks,
                deletedTaskIds: state.deletedTaskIds || []
            });
        }

        showNotification("Vazife silindi.", "success");
        window.render();
    } catch (err) {
        console.error("Vazife silinirken hata:", err);
        showNotification("Vazife silindi.", "success");
        window.render();
    }
};

// DÜZENLEME İŞLEMLERİ İÇİN EKLENEN GLOBAL FONKSİYONLAR
window.openEditTaskModal = function(taskId) {
    const task = (state.tasks || []).find(t => String(t.id) === String(taskId));
    if (task) {
        window.editingTask = { ...task };
        window.render();
    }
};

window.closeEditTaskModal = function() {
    window.editingTask = null;
    window.render();
};

window.saveEditedTask = async function() {
    if (!window.editingTask) return;

    const titleInput = document.getElementById('edit-task-title');
    const categorySelect = document.getElementById('edit-task-category');
    
    const newTitle = titleInput ? titleInput.value.trim() : '';
    const newCategory = categorySelect ? categorySelect.value : 'Özel';

    if (!newTitle) {
        showNotification("Vazife başlığı boş olamaz.", "error");
        return;
    }

    state.tasks = state.tasks.map(t => {
        if (String(t.id) === String(window.editingTask.id)) {
            return { ...t, title: newTitle, category: newCategory };
        }
        return t;
    });

    try {
        if (state.user) {
            const userRef = doc(db, "users", state.user.uid);
            await updateDoc(userRef, {
                tasks: state.tasks
            });
        }

        window.editingTask = null;
        showNotification("Vazife güncellendi.", "success");
        window.render();
    } catch (err) {
        console.error("Vazife güncellenirken hata:", err);
        showNotification("Güncellenirken hata oluştu.", "error");
    }
};
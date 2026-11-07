import { state, loadStudents, getTodayString, showNotification } from './state.js';
import { getTreePhaseDisplay } from './dashboard.js';
import { db } from '../firebase-config.js';

const { doc, updateDoc } = window.firebaseModules;

window.toggleStudentCard = function(studentId) {
    window.expandedStudentId = window.expandedStudentId === studentId ? null : studentId;
    window.render();
};

window.updateStudentContact = async function(studentId) {
    const today = getTodayString();
    try {
        const studentRef = doc(db, "users", studentId);
        await updateDoc(studentRef, {
            lastContactDate: today
        });

        const student = (state.students || []).find(s => s.id === studentId);
        if (student) {
            student.lastContactDate = today;
        }

        showNotification("kullanıcınin son irtibat tarihi güncellendi!", "success");
        window.render();
    } catch (err) {
        console.error("İrtibat güncellenirken hata:", err);
        showNotification("Güncelleme sırasında hata oluştu.", "error");
    }
};

window.openStudentInfoModal = function(studentId) {
    const student = (state.students || []).find(s => s.id === studentId);
    if (student) {
        window.editingStudentInfo = { ...student };
        window.render();
    }
};

window.closeStudentInfoModal = function() {
    window.editingStudentInfo = null;
    window.render();
};

window.saveStudentInfo = async function(event) {
    event.preventDefault();
    if (!window.editingStudentInfo) return;

    const studentId = window.editingStudentInfo.id;
    const phone = document.getElementById('edit-student-phone').value.trim();
    const location = document.getElementById('edit-student-location').value.trim();
    const notes = document.getElementById('edit-student-notes').value.trim();

    try {
        const studentRef = doc(db, "users", studentId);
        await updateDoc(studentRef, {
            phone: phone,
            location: location,
            notes: notes
        });

        const student = (state.students || []).find(s => s.id === studentId);
        if (student) {
            student.phone = phone;
            student.location = location;
            student.notes = notes;
        }

        window.editingStudentInfo = null;
        showNotification("kullanıcı bilgileri başarıyla güncellendi!", "success");
        window.render();
    } catch (err) {
        console.error("Bilgiler güncellenirken hata:", err);
        showNotification("Güncelleme sırasında hata oluştu.", "error");
    }
};

// Yalnızca Ezber, Mütalaa ve Şehadetname/Mütalaa Verme alanları için 1 ay (30 gün) kontrolü
function isReviewableCategory(category) {
    if (!category) return false;
    const catLower = category.toLowerCase();
    return catLower.includes('ezber') || catLower.includes('mütalaa') || catLower.includes('mütalaa verme') || catLower.includes('şehadetname');
}

function isOlderThanOneMonth(dateString) {
    if (!dateString) return false;
    const completedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - completedDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 30;
}

export function renderSupervisor() {
    const modalStudent = window.editingStudentInfo;

    return `
        <div class="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-xl font-black text-slate-800">🛡️ Sorumlu İdare Paneli</h2>
                    <p class="text-xs text-slate-500 font-medium">Kullanıcı bilgilerini inceleyin. Manevi gelişimlerini takip edin.</p>
                </div>
            </div>

            <div class="space-y-4">
                ${state.isLoadingStudents ? `
                    <div class="text-center py-12 bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl shadow-sm space-y-3">
                        <div class="w-10 h-10 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p class="text-xs font-bold text-slate-600">kullanıcı verileri yükleniyor...</p>
                    </div>
                ` : state.students && state.students.length > 0 ? state.students.map(s => {
                    const isExpanded = window.expandedStudentId === s.id;
                    const treeInfo = getTreePhaseDisplay(s.treePhase || 'tohum1');
                    
                    const studentHistory = s.completedHistory || [];
                    
                    let latestCompletedTasks = [];
                    if (studentHistory.length > 0) {
                        const dates = studentHistory.map(t => t.completedAt).filter(Boolean);
                        if (dates.length > 0) {
                            const latestDate = dates.sort().pop();
                            latestCompletedTasks = studentHistory.filter(t => t.completedAt === latestDate);
                        } else {
                            latestCompletedTasks = studentHistory;
                        }
                    }

                    // Yalnızca Ezber, Mütalaa ve Şehadetname kategorilerinde üzerinden 1 ay geçenler
                    const reviewNeededTasks = studentHistory.filter(t => isReviewableCategory(t.category) && isOlderThanOneMonth(t.completedAt));
                    
                    const displayName = s.fullName ? s.fullName : (s.email ? s.email.split('@')[0] : 'İsimsiz kullanıcı');
                    const lastContact = s.lastContactDate ? s.lastContactDate : 'Henüz görüşülmedi';

                    return `
                        <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl overflow-hidden shadow-sm transition-all">
                            <div class="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                                <div class="flex items-center gap-4 cursor-pointer flex-1" onclick="toggleStudentCard('${s.id}')">
                                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-300 border-b-4 border-b-emerald-400 flex items-center justify-center text-2xl shadow-sm shrink-0">
                                        ${treeInfo.icon}
                                    </div>
                                    <div>
                                        <h4 class="font-black text-slate-800 text-base">${displayName}</h4>
                                        <div class="flex flex-wrap items-center gap-2 mt-1">
                                            <span class="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                                                ${treeInfo.title}
                                            </span>
                                            <span class="text-xs text-slate-400 font-bold">🔥 Seri: ${s.streak || 0} Gün</span>
                                            <span class="text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                                                📞 Son İrtibat: ${lastContact}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                                    <button onclick="updateStudentContact('${s.id}')" class="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-black rounded-xl border-2 border-sky-600 border-b-3 border-b-sky-700 shadow-sm transition-all active:translate-y-0.5 flex items-center gap-1" title="Son İrtibatı Güncelle">
                                        <span>📅</span> İrtibat Kuruldu
                                    </button>
                                    <button onclick="toggleStudentCard('${s.id}')" class="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black rounded-xl border-2 border-stone-200">
                                        ${isExpanded ? '▲ Kapat' : '▼ Detay'}
                                    </button>
                                </div>
                            </div>

                            ${isExpanded ? `
                                <div class="p-6 bg-stone-50 border-t-2 border-stone-200 space-y-6 animate-fadeIn">
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        
                                        <!-- 1. KİMLİK & İLETİŞİM BİLGİLERİ -->
                                        <div class="bg-white border-2 border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
                                            <div class="space-y-2">
                                                <div class="flex justify-between items-center border-b border-stone-100 pb-2">
                                                    <h5 class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                        <span>👤</span> Kimlik
                                                    </h5>
                                                    <button onclick="openStudentInfoModal('${s.id}')" class="text-xs font-black text-emerald-600 hover:underline">
                                                        ${s.phone || s.location || s.notes ? 'Düzenle' : 'Güncelle'}
                                                    </button>
                                                </div>

                                                <div class="space-y-1.5 text-xs text-slate-600">
                                                    <p><strong>E-posta:</strong> ${s.email || 'Belirtilmemiş'}</p>
                                                    <p><strong>Telefon:</strong> ${s.phone || '<span class="text-stone-400 italic">Girilmemiş</span>'}</p>
                                                    <p><strong>Meşgale:</strong> ${s.location || '<span class="text-stone-400 italic">Girilmemiş</span>'}</p>
                                                    <p><strong>Notlar:</strong> ${s.notes || '<span class="text-stone-400 italic">Yok</span>'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 2. EZBER / MÜTALAA / ŞEHADETNAME TEKRAR VAKTİ (1 AY+) -->
                                        <div class="bg-amber-50/60 border-2 border-amber-200 rounded-2xl p-4 space-y-3 shadow-sm">
                                            <h5 class="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-200 pb-2">
                                                <span>🔄</span> Tekrar Vakti (Ezber/Mütalaa) (${reviewNeededTasks.length})
                                            </h5>
                                            
                                            <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
                                                ${reviewNeededTasks.length > 0 ? reviewNeededTasks.map(t => `
                                                    <div class="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between text-xs shadow-xs">
                                                        <div>
                                                            <span class="font-bold text-slate-800">${t.title}</span>
                                                            <span class="block text-[9px] text-amber-800 font-semibold">${t.category}</span>
                                                        </div>
                                                        <span class="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                                            📅 ${t.completedAt}
                                                        </span>
                                                    </div>
                                                `).join('') : `
                                                    <p class="text-xs text-amber-700/70 italic text-center py-4">Tekrar zamanı gelen ezber veya mütalaa yok.</p>
                                                `}
                                            </div>
                                        </div>

                                        <!-- 3. SON GÜN ATLATMASI VAZİFELERİ -->
                                        <div class="bg-white border-2 border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm">
                                            <h5 class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                                                <span>📚</span> Son Gün Atlatması
                                            </h5>
                                            
                                            <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
                                                ${latestCompletedTasks.length > 0 ? latestCompletedTasks.map(t => `
                                                    <div class="p-2.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
                                                        <span class="font-bold text-slate-800">${t.title}</span>
                                                        <span class="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                            ✅ ${t.completedAt || ''}
                                                        </span>
                                                    </div>
                                                `).join('') : `
                                                    <p class="text-xs text-stone-400 italic text-center py-4">Arşive aktarılan vazife yok.</p>
                                                `}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('') : `
                    <div class="text-center py-12 bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl shadow-sm space-y-3">
                        <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl">👥</div>
                        <p class="text-sm font-bold text-slate-700">Sistemde size bağlı kullanıcı bulunamadı.</p>
                    </div>
                `}
            </div>
        </div>

        ${modalStudent ? `
            <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-xl">
                    <div class="flex justify-between items-center border-b-2 border-stone-100 pb-3">
                        <h4 class="text-sm font-black text-slate-800">✏️ Kullanıcı Bilgilerini Düzenle</h4>
                        <button onclick="closeStudentInfoModal()" class="text-stone-400 hover:text-rose-600 font-black text-sm">✕</button>
                    </div>
                    
                    <form onsubmit="saveStudentInfo(event)" class="space-y-3">
                        <div>
                            <label class="block text-[10px] font-black uppercase text-stone-500 mb-1">Telefon Numarası</label>
                            <input type="text" id="edit-student-phone" placeholder="Örn: 0555 444 33 22" value="${modalStudent.phone || ''}" class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black uppercase text-stone-500 mb-1">Meşgale</label>
                            <input type="text" id="edit-student-location" placeholder="Örn: Öğrenci / Vekil İmam" value="${modalStudent.location || ''}" class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black uppercase text-stone-500 mb-1">Notlar</label>
                            <textarea id="edit-student-notes" placeholder="Kullanıcı hakkında notlar..." class="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 h-20 resize-none">${modalStudent.notes || ''}</textarea>
                        </div>
                        
                        <div class="flex gap-2 pt-2">
                            <button type="submit" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-xs border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm active:translate-y-0.5 transition-all">
                                Kaydet
                            </button>
                            <button type="button" onclick="closeStudentInfoModal()" class="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black rounded-2xl text-xs border-2 border-stone-200 border-b-4 border-b-stone-300">
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        ` : ''}
    `;
}
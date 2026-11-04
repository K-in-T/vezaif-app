import { state, saveUserData, showNotification } from './state.js';

window.selectedCourseLevel = window.selectedCourseLevel || 1;

export const STATIC_CURRICULUM = [
    {
        level: 1,
        title: "1. Kur (Başlangıç Seviyesi)",
        description: "Temel medrese disiplini, günlük Kur'an okuması, mütalaa ve yazı temelleri.",
        tasks: [
            { id: 'k1_t1', title: "Kur'an-ı Kerim (Yüzünden / 1 Cüz)", category: "Kur'an" },
            { id: 'k1_t2', title: "Risale-i Nur Mütalaası (5 Sayfa)", category: "Mütalaa" },
            { id: 'k1_t3', title: "Yazı Temel Metin Okuma", category: "Yazı" },
            { id: 'k1_t4', title: "Temel Ezber (Kısa Sureler)", category: "Ezber" }
        ]
    },
    {
        level: 2,
        title: "2. Kur (Gelişme Seviyesi)",
        description: "Arapça gramer başlangıcı ve metin okuma pratiklerinin artırılması.",
        tasks: [
            { id: 'k2_t1', title: "Kur'an-ı Kerim (1 Cüz)", category: "Kur'an" },
            { id: 'k2_t2', title: "Risale-i Nur Mütalaası (10 Sayfa)", category: "Mütalaa" },
            { id: 'k2_t3', title: "Yazı Yazma ve Metin Çözümleme", category: "Yazı" },
            { id: 'k2_t4', title: "Arapça Sarf Çalışması (Emsile)", category: "Mütalaa" }
        ]
    },
    {
        level: 3,
        title: "3. Kur (Orta Seviye)",
        description: "Arapça nahif adımları, derinlemesine mütalaa ve hıfz başlangıcı.",
        tasks: [
            { id: 'k3_t1', title: "Kur'an-ı Kerim (1 Cüz)", category: "Kur'an" },
            { id: 'k3_t2', title: "Risale-i Nur Mütalaası (15 Sayfa)", category: "Mütalaa" },
            { id: 'k3_t3', title: "Yazı Arşiv Metinleri Okuması", category: "Yazı" },
            { id: 'k3_t4', title: "Arapça Sarf (Bina / Avamil)", category: "Mütalaa" }
        ]
    },
    {
        level: 4,
        title: "4. Kur (İleri Başlangıç)",
        description: "Metin tahlilleri, nahiv çalışmaları ve istikrarlı okumalar.",
        tasks: [
            { id: 'k4_t1', title: "Kur'an-ı Kerim Mukabele", category: "Kur'an" },
            { id: 'k4_t2', title: "Risale-i Nur Mütalaası (20 Sayfa)", category: "Mütalaa" },
            { id: 'k4_t3', title: "Yazı Süratli Metin Okuma", category: "Yazı" },
            { id: 'k4_t4', title: "Arapça Nahiv (İzhari)", category: "Mütalaa" }
        ]
    },
    {
        level: 5,
        title: "5. Kur (Merkez Seviye)",
        description: "Orta-İleri düzey Arapça gramer ve şerh mütalaaları.",
        tasks: [
            { id: 'k5_t1', title: "Kur'an-ı Kerim & Tefsir Okuması", category: "Kur'an" },
            { id: 'k5_t2', title: "Risale-i Nur Külliyatı Mütalaası", category: "Mütalaa" },
            { id: 'k5_t3', title: "Yazı Edebi Metin Analizi", category: "Yazı" },
            { id: 'k5_t4', title: "Arapça Nahiv (Kafiye)", category: "Mütalaa" }
        ]
    },
    {
        level: 6,
        title: "6. Kur (Yüksek İlimler - 1)",
        description: "İleri düzey Arapça metin tahlili ve fıkıh usulü giriş.",
        tasks: [
            { id: 'k6_t1', title: "Kur'an-ı Kerim Hafızlık / Tekrar", category: "Kur'an" },
            { id: 'k6_t2', title: "Ali Mütalaa ve Tahlil Çalışması", category: "Mütalaa" },
            { id: 'k6_t3', title: "Yazı Hüsn-i Hat / Yazı Çalışması", category: "Yazı" },
            { id: 'k6_t4', title: "Fıkıh Usulü Mütalaası", category: "Mütalaa" }
        ]
    },
    {
        level: 7,
        title: "7. Kur (Yüksek İlimler - 2)",
        description: "Kelam ve akâid sahasında derinlemesine eser mütalaaları.",
        tasks: [
            { id: 'k7_t1', title: "Kur'an-ı Kerim Mukabele", category: "Kur'an" },
            { id: 'k7_t2', title: "Akâid ve Kelam Mütalaası", category: "Mütalaa" },
            { id: 'k7_t3', title: "Yazı Divan Edebiyatı Metinleri", category: "Yazı" },
            { id: 'k7_t4', title: "Arapça Şerhli Metin Okumaları", category: "Mütalaa" }
        ]
    },
    {
        level: 8,
        title: "8. Kur (İhtisas - 1)",
        description: "Tefsir ve hadis ilimlerinde ihtisaslaşma adımları.",
        tasks: [
            { id: 'k8_t1', title: "Tefsir Usulü ve Kur'an Araştırması", category: "Kur'an" },
            { id: 'k8_t2', title: "Hadis Metinleri Mütalaası", category: "Mütalaa" },
            { id: 'k8_t3', title: "Yazı Belagat Metinleri", category: "Yazı" },
            { id: 'k8_t4', title: "İleri Düzey Belagat (Maânî)", category: "Mütalaa" }
        ]
    },
    {
        level: 9,
        title: "9. Kur (İhtisas - 2)",
        description: "Müntesip seviye ilmi çalışmalar ve risale tetkikleri.",
        tasks: [
            { id: 'k9_t1', title: "Kur'an-ı Kerim Araştırmaları", category: "Kur'an" },
            { id: 'k9_t2', title: "İleri Mütalaa & Müzakere", category: "Mütalaa" },
            { id: 'k9_t3', title: "Yazı Telif ve Rapor Hazırlama", category: "Yazı" },
            { id: 'k9_t4', title: "İslam Tarihi ve Siyer Mütalaası", category: "Mütalaa" }
        ]
    },
    {
        level: 10,
        title: "10. Kur (Zirve / İcazet Seviyesi)",
        description: "Medrese müfredatının en üst noktası, tamim ve icazet hazırlığı.",
        tasks: [
            { id: 'k10_t1', title: "Kur'an-ı Kerim Hatim ve Hafızlık İkmali", category: "Kur'an" },
            { id: 'k10_t2', title: "Külliyat ve Tedrisat Mütalaası", category: "Mütalaa" },
            { id: 'k10_t3', title: "Yazı Klasik Eser İncelemesi", category: "Yazı" },
            { id: 'k10_t4', title: "İlmi Araştırma ve Müzakere", category: "Mütalaa" }
        ]
    }
];

export function renderCurriculumTab() {
    const currentCourse = STATIC_CURRICULUM.find(c => c.level === window.selectedCourseLevel) || STATIC_CURRICULUM[0];

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 shadow-sm">
                <h2 class="text-xl font-black text-slate-800">📖 Medrese Kurları (1 - 10)</h2>
                <p class="text-xs text-slate-500 font-medium">Bulunduğunuz kuru seçerek günlük programınıza ekleyin.</p>
            </div>

            <div class="bg-white p-4 rounded-3xl border-2 border-stone-200 flex gap-2 overflow-x-auto">
                ${STATIC_CURRICULUM.map(c => `
                    <button onclick="setCourseLevel(${c.level})" class="px-4 py-2 rounded-2xl text-xs font-black ${window.selectedCourseLevel === c.level ? 'bg-emerald-500 text-white' : 'bg-stone-50 text-slate-600'}">
                        ${c.level}. Kur
                    </button>
                `).join('')}
            </div>

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 class="text-lg font-black text-slate-800">${currentCourse.title}</h3>
                <div class="space-y-3">
                    ${currentCourse.tasks.map(item => {
                        const isInProgram = state.tasks.some(t => t.curriculumId === item.id);
                        return `
                            <div class="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl flex justify-between items-center">
                                <div>
                                    <h5 class="font-bold text-sm text-slate-800">${item.title}</h5>
                                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-stone-200 text-stone-700">${item.category}</span>
                                </div>
                                <button onclick="toggleTaskSelection('${item.id}')" class="px-4 py-2 rounded-2xl text-xs font-black ${isInProgram ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500 text-white'}">
                                    ${isInProgram ? '✓ Programımda' : '+ Programıma Ekle'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

window.setCourseLevel = function(level) { window.selectedCourseLevel = level; window.render(); };

window.toggleTaskSelection = async function(currId) {
    let foundItem = null;
    STATIC_CURRICULUM.forEach(c => {
        const match = c.tasks.find(t => t.id === currId);
        if (match) foundItem = match;
    });

    const index = state.tasks.findIndex(t => t.curriculumId === currId);
    if (index !== -1) {
        state.tasks.splice(index, 1);
        showNotification("Vazife çıkarıldı.", "info");
    } else {
        state.tasks.push({ id: Date.now(), curriculumId: currId, title: foundItem.title, category: foundItem.category, completed: false });
        showNotification("Vazife eklendi! 🎯", "success");
    }
    await saveUserData();
    window.render();
};
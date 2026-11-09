import { db } from '../firebase-config.js';
import { state, saveUserData, showNotification } from './state.js';

const { doc, updateDoc } = window.firebaseModules;

window.selectedCourseLevel = window.selectedCourseLevel || 1;
window.showCurriculumInfoModal = window.showCurriculumInfoModal || false;
window.toggleCurriculumInfoModal = function() {
    window.showCurriculumInfoModal = !window.showCurriculumInfoModal;
    window.render();
};

window.handleAddNewCustomTask = async function() {
    const input = document.getElementById('custom-task-input');
    const categorySelect = document.getElementById('custom-task-category');
    const title = input ? input.value.trim() : '';
    const category = categorySelect ? categorySelect.value : 'Özel';
    
    if (!title) {
        showNotification("Lütfen vazife başlığı girin.", "error");
        return;
    }

    const newTask = {
        id: 'custom_' + Date.now(),
        title: title,
        category: category,
        completed: false
    };

    if (!state.tasks) {
        state.tasks = [];
    }

    state.tasks.push(newTask);

    try {
        if (state.user) {
            const userRef = doc(db, "users", state.user.uid);
            await updateDoc(userRef, {
                tasks: state.tasks
            });
        }

        input.value = '';
        showNotification("Özel vazife başarıyla eklendi!", "success");
        window.render();
    } catch (err) {
        console.error("Özel vazife eklenirken hata:", err);
        showNotification("Vazife eklenirken bir hata oluştu.", "error");
    }
};

export const STATIC_CURRICULUM = [
    {
        level: 1,
        title: "1. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k1_kuran_1", title: "Esre dahil bitecek", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_2", title: "Çeker bitecek", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_3", title: "İki ötre bitecek", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_4", title: "Namaz Duaları bitecek", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_5", title: "Fil Suresi bitecek", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_6", title: "Nas Suresi bitecek", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_7", title: "1-5. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_8", title: "6-10. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_9", title: "11-18. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_10", title: "19-26. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_11", title: "27-34. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_12", title: "35-42. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_13", title: "43-51. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k1_kuran_14", title: "52-60. sayfalar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k1_mutalaa_1", title: "Mütalaa saatinde Kur'ân çalışılacak", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_2", title: "Okuma usulünün ilk yarısı", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_3", title: "Okuma usulünün ikinci yarısı", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_4", title: "1. Söz ilk 3 sayfa (hızlandırma usulü ile)", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_5", title: "1. Söz son 2 sayfası, Yazı Mektubu (hızlandırma usulü ile)", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_6", title: "Gençlik Rehberi 1-7. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_7", title: "Gençlik Rehberi 8-14. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_8", title: "Gençlik Rehberi 15-25. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_9", title: "Gençlik Rehberi 26-36. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_10", title: "Gençlik Rehberi 37-46. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_11", title: "Gençlik Rehberi 47-58. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_12", title: "Gençlik Rehberi 59-71. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k1_mutalaa_13", title: "Gençlik Rehberi 72-84. sayfalar", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k1_ezber_1", title: "Ezber saatinde Elif-Ba veya usul çalışılacak", category: "Ezber Çalışması" },
            { id: "k1_ezber_2", title: "Sübhaneke, Tahiyyat, Salli-Barik, Rabbena, Rabbenağfirli", category: "Ezber Çalışması" },
            { id: "k1_ezber_3", title: "Kunut 1, Kunut 2, Fatiha, Amentü", category: "Ezber Çalışması" },
            { id: "k1_ezber_4", title: "Fil, Kureyş, Maun, Kevser", category: "Ezber Çalışması" },
            { id: "k1_ezber_5", title: "Kafirun, Nasr, Tebbet, İhlas", category: "Ezber Çalışması" },
            { id: "k1_ezber_6", title: "Felak, Nas, Müezzinlik", category: "Ezber Çalışması" },
            { id: "k1_ezber_7", title: "Ayete'l-Kürsi, Salaten Tüncina, Salate'n-Nariye", category: "Ezber Çalışması" },
            { id: "k1_ezber_8", title: "1. Sözün 1-16. satırları", category: "Ezber Çalışması" },
            { id: "k1_ezber_9", title: "1. Sözün 17-32. satırları", category: "Ezber Çalışması" },
            { id: "k1_ezber_10", title: "1. Sözün 33-49. satırları", category: "Ezber Çalışması" },
            { id: "k1_ezber_11", title: "Yazı Mektubu", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k1_yazi_1", title: "Muhtasar Hüsn-i Hat Kitapçığı 1/7", category: "Yazı Çalışması" },
            { id: "k1_yazi_2", title: "Tekrarlı 1. Söz'ün 1-7. sayfaları", category: "Yazı Çalışması" },
            { id: "k1_yazi_3", title: "Tekrarlı 1. Söz'ün 8-14. sayfaları", category: "Yazı Çalışması" },
            { id: "k1_yazi_4", title: "Tekrarlı 1. Söz'ün 15-21. sayfaları", category: "Yazı Çalışması" },
            { id: "k1_yazi_5", title: "Tekrarlı 1. Söz'ün 22-28. sayfaları", category: "Yazı Çalışması" },
            { id: "k1_yazi_6", title: "Tekrarlı 1. Söz'ün 29-35. sayfaları", category: "Yazı Çalışması" },
            { id: "k1_yazi_7", title: "Tekrarlı 1. Söz'ün 36-42. sayfaları", category: "Yazı Çalışması" },
            { id: "k1_yazi_8", title: "Tekrarlı 1. Söz'ün 43-49. sayfaları", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k1_kitap_1", title: "İslam Ahlakı 1-32. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_2", title: "İslam Ahlakı 33-64. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_3", title: "İslam Ahlakı 65-96. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_4", title: "İslam Ahlakı 97-128. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_5", title: "İslam Ahlakı 129-160. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_6", title: "İslam Ahlakı 161-206. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_7", title: "Namaz Hocası 1-30. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_8", title: "Namaz Hocası 31-60. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_9", title: "Namaz Hocası 61-90. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_10", title: "Namaz Hocası 91-120. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_11", title: "Namaz Hocası 121-150. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_12", title: "Namaz Hocası 151-180. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_13", title: "Namaz Hocası 181-210. sayfalar", category: "Okunacak Kitaplar" },
            { id: "k1_kitap_14", title: "Namaz Hocası 211-243. sayfalar", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k1_mutalaaverme_1", title: "1. Söz'ün 1 ve 2. sayfaları", category: "Mütalaa Verme Çalışması" },
            { id: "k1_mutalaaverme_2", title: "1. Söz'ün 3, 4 ve 5. sayfaları", category: "Mütalaa Verme Çalışması" },
            { id: "k1_mutalaaverme_3", title: "Yazı Mektubu", category: "Mütalaa Verme Çalışması" }
        ]
    },
    {
        level: 2,
        title: "2. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k2_kuran_1", title: "61-70. sayfalar, tecvidin tanımı", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_2", title: "71-80. sayfalar, tecvide giriş", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_3", title: "81-90. sayfalar, kalın harfler, peltek harfler", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_4", title: "91-100. sayfalar, sebe-i med, harf-i med", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_5", title: "101-110. sayfalar, medd-i tabi, medd-i muttasıl", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_6", title: "111-120. sayfalar, medd-i munfasıl, medd-i lazım", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_7", title: "121-130. sayfalar, medd-i arız, medd-i lin", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_8", title: "131-140. sayfalar, idğam-ı meal gunne, idğam-ı bila gunne", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_9", title: "141-150. sayfalar, idğam-ı misleyn, idğam-ı mütecaniseyn, idğam-ı mütekaribeyn", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_10", title: "151-160. sayfalar, iklab", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_11", title: "161-170. sayfalar, izhar, ihfa", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_12", title: "171-180. sayfalar, idğam-ı misleyn-i meal günne, dudak ihfası", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_13", title: "181-190. sayfalar, kalkale, hükmürra", category: "Kur'ân-ı Kerim" },
            { id: "k2_kuran_14", title: "191-200. sayfalar, secavendler", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k2_mutalaa_1", title: "Sözler 1-10", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_2", title: "Sözler 11-23", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_3", title: "Beş Risale 1-20", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_4", title: "Beş Risale 21-45", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_5", title: "Beş Risale 46-70", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_6", title: "Beş Risale 71-95", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_7", title: "Mektubat-1 1-30", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_8", title: "Mektubat-1 31-60", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_9", title: "Mektubat-1 61-90", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_10", title: "Mektubat-1 91-120", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_11", title: "Mektubat-1 121-155", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_12", title: "Mektubat-1 156-190", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_13", title: "Mektubat-1 191-230", category: "Risale-i Nur Mütalaası" },
            { id: "k2_mutalaa_14", title: "Mektubat-1 231-272", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k2_ezber_1", title: "Haşir Suresi son 5 ayeti", category: "Ezber Çalışması" },
            { id: "k2_ezber_2", title: "Bakara Suresinin son 2 ayeti", category: "Ezber Çalışması" },
            { id: "k2_ezber_3", title: "Onuncu Hüccet-i İmaniye 1. kelimeye kadar", category: "Ezber Çalışması" },
            { id: "k2_ezber_4", title: "Onuncu Hüccet-i İmaniye 1, 2 ve 3. kelimeler", category: "Ezber Çalışması" },
            { id: "k2_ezber_5", title: "Onuncu Hüccet-i İmaniye 4 ve 5. kelimeler", category: "Ezber Çalışması" },
            { id: "k2_ezber_6", title: "Onuncu Hüccet-i İmaniye 6, 7 ve 8. kelimeler", category: "Ezber Çalışması" },
            { id: "k2_ezber_7", title: "Onuncu Hüccet-i İmaniye 9. kelime", category: "Ezber Çalışması" },
            { id: "k2_ezber_8", title: "Onuncu Hüccet-i İmaniye 10. kelime", category: "Ezber Çalışması" },
            { id: "k2_ezber_9", title: "Onuncu Hüccet-i İmaniye 11. kelime", category: "Ezber Çalışması" },
            { id: "k2_ezber_10", title: "Namaz Duası 1-19. satırlar (Allahümme inna nes'elükeye kadar)", category: "Ezber Çalışması" },
            { id: "k2_ezber_11", title: "Namaz Duası 20-36. satırlar (Allahümme rabbenaya kadar)", category: "Ezber Çalışması" },
            { id: "k2_ezber_12", title: "Namaz Duası 37-53. satırlar (sonuna kadar)", category: "Ezber Çalışması" },
            { id: "k2_ezber_13", title: "Yemek Duası 1-17. satırlar (fahr-ı aleme kadar)", category: "Ezber Çalışması" },
            { id: "k2_ezber_14", title: "Yemek Duası 18-34. satırlar (sonuna kadar)", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k2_yazi_1", title: "Gençlik Rehberi 1-12", category: "Yazı Çalışması" },
            { id: "k2_yazi_2", title: "Gençlik Rehberi 13-24", category: "Yazı Çalışması" },
            { id: "k2_yazi_3", title: "Gençlik Rehberi 25-36", category: "Yazı Çalışması" },
            { id: "k2_yazi_4", title: "Gençlik Rehberi 37-48", category: "Yazı Çalışması" },
            { id: "k2_yazi_5", title: "Gençlik Rehberi 49-60", category: "Yazı Çalışması" },
            { id: "k2_yazi_6", title: "Gençlik Rehberi 61-72", category: "Yazı Çalışması" },
            { id: "k2_yazi_7", title: "Gençlik Rehberi 73-84", category: "Yazı Çalışması" },
            { id: "k2_yazi_8", title: "Beş Risale 1-13", category: "Yazı Çalışması" },
            { id: "k2_yazi_9", title: "Beş Risale 14-26", category: "Yazı Çalışması" },
            { id: "k2_yazi_10", title: "Beş Risale 27-39", category: "Yazı Çalışması" },
            { id: "k2_yazi_11", title: "Beş Risale 40-52", category: "Yazı Çalışması" },
            { id: "k2_yazi_12", title: "Beş Risale 53-65", category: "Yazū Çalışması" },
            { id: "k2_yazi_13", title: "Beş Risale 66-80", category: "Yazı Çalışması" },
            { id: "k2_yazi_14", title: "Beş Risale 81-95", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k2_kitap_1", title: "Risale-i Nur'un Mahiyeti 1-25", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_2", title: "Risale-i Nur'un Mahiyeti 26-50", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_3", title: "Risale-i Nur'un Mahiyeti 51-75", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_4", title: "Risale-i Nur'un Mahiyeti 76-100", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_5", title: "Risale-i Nur'un Mahiyeti 101-125", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_6", title: "Risale-i Nur'un Mahiyeti 126-150", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_7", title: "Risale-i Nur'un Mahiyeti 151-175", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_8", title: "Risale-i Nur'un Mahiyeti 176-200", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_9", title: "Risale-i Nur'un Mahiyeti 201-237", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_10", title: "Delilleriyle İman Esasları 1-30", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_11", title: "Delilleriyle İman Esasları 31-60", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_12", title: "Delilleriyle İman Esasları 61-90", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_13", title: "Delilleriyle İman Esasları 91-120", category: "Okunacak Kitaplar" },
            { id: "k2_kitap_14", title: "Delilleriyle İman Esasları 121-164", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k2_mutalaaverme_1", title: "Onuncu Hücceti İmaniye 4. kelimeye kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k2_mutalaaverme_2", title: "Onuncu Hücceti İmaniye 5, 6, 7 ve 8. kelimeler", category: "Mütalaa Verme Çalışması" },
            { id: "k2_mutalaaverme_3", title: "9, 10 ve 11. kelimeler", category: "Mütalaa Verme Çalışması" },
            { id: "k2_mutalaaverme_4", title: "Şeker Mektubu", category: "Mütalaa Verme Çalışması" }
        ]
    },
    {
        level: 3,
        title: "3. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k3_kuran_1", title: "201-215. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_2", title: "216-230. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_3", title: "231-245. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_4", title: "246-260. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_5", title: "261-270. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_6", title: "271-285. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_7", title: "286-300. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_8", title: "301-315. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_9", title: "316-330. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_10", title: "331-345. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_11", title: "346-360. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_12", title: "361-373. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_13", title: "374-386. sayfalar", category: "Kur'ân-ı Kerim" },
            { id: "k3_kuran_14", title: "387-400. sayfalar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k3_mutalaa_1", title: "Asa-yı Musa 1-25. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_2", title: "Asa-yı Musa 26-50. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_3", title: "Asa-yı Musa 51-75. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_4", title: "Asa-yı Musa 76-100. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_5", title: "Asa-yı Musa 101-130. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_6", title: "Asa-yı Musa 131-160. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_7", title: "Asa-yı Musa 161-190. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_8", title: "Asa-yı Musa 191-220. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_9", title: "Asa-yı Musa 221-250. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_10", title: "Asa-yı Musa 251-280. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_11", title: "Asa-yı Musa 281-318. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_12", title: "Hanımlar Rehberi 1-50. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_13", title: "Hanımlar Rehberi 51-100. sayfalar", category: "Risale-i Nur Mütalaası" },
            { id: "k3_mutalaa_14", title: "Hanımlar Rehberi 101-161. sayfalar", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k3_ezber_1", title: "Elif-Lam-Mim", category: "Ezber Çalışması" },
            { id: "k3_ezber_2", title: "Nebe Suresi 1-10. satırlar", category: "Ezber Çalışması" },
            { id: "k3_ezber_3", title: "Nebe Suresi 11-19. satırlar", category: "Ezber Çalışması" },
            { id: "k3_ezber_4", title: "Fetih Suresi'nin son 3 ayetinin 1-6. satırlar", category: "Ezber Çalışması" },
            { id: "k3_ezber_5", title: "Fetih Suresi'nin son 3 ayetinin 7-11. satırlar", category: "Ezber Çalışması" },
            { id: "k3_ezber_6", title: "6. Hüccet-i İmaniye 1. sayfası", category: "Ezber Çalışması" },
            { id: "k3_ezber_7", title: "6. Hüccet-i İmaniye 2. sayfası", category: "Ezber Çalışması" },
            { id: "k3_ezber_8", title: "6. Hüccet-i İmaniye 3. sayfası", category: "Ezber Çalışması" },
            { id: "k3_ezber_9", title: "6. Hüccet-i İmaniye 4. sayfası", category: "Ezber Çalışması" },
            { id: "k3_ezber_10", title: "6. Hüccet-i İmaniye 5. sayfası", category: "Ezber Çalışması" },
            { id: "k3_ezber_11", title: "6. Hüccet-i İmaniye 6. sayfası", category: "Ezber Çalışması" },
            { id: "k3_ezber_12", title: "Tercüman-ı İsm-i Azam", category: "Ezber Çalışması" },
            { id: "k3_ezber_13", title: "İstiaze Duası 1-16. satırlar (Fitneti'l-fasikine kadar)", category: "Ezber Çalışması" },
            { id: "k3_ezber_14", title: "İstiaze Duası 17-32. satırlar (sonuna kadar)", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k3_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k3_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k3_kitap_1", title: "Risale-i Nur Konularına Giriş 1-45", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_2", title: "Risale-i Nur Konularına Giriş 46-90", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_3", title: "Risale-i Nur Konularına Giriş 91-135", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_4", title: "Risale-i Nur Konularına Giriş 136-180", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_5", title: "Risale-i Nur Konularına Giriş 181-225", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_6", title: "Risale-i Nur Konularına Giriş 226-270", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_7", title: "Risale-i Nur Konularına Giriş 271-315", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_8", title: "Risale-i Nur Konularına Giriş 316-358", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_9", title: "Tebliğ Usulleri 1-50", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_10", title: "Tebliğ Usulleri 51-100", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_11", title: "Tebliğ Usulleri 101-150", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_12", title: "Tebliğ Usulleri 151-200", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_13", title: "Tebliğ Usulleri 201-250", category: "Okunacak Kitaplar" },
            { id: "k3_kitap_14", title: "Tebliğ Usulleri 251-295", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k3_mutalaaverme_1", title: "İhlas baştan 3. Düstur'a kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k3_mutalaaverme_2", title: "3 ve 4. Düstur", category: "Mütalaa Verme Çalışması" },
            { id: "k3_mutalaaverme_3", title: "İhlas'ın kalan kısmı", category: "Mütalaa Verme Çalışması" },
            { id: "k3_mutalaaverme_4", title: "Altıncı Huccet-i İmaniye", category: "Mütalaa Verme Çalışması" }
        ]
    },
    {
        level: 4,
        title: "4. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k4_kuran_1", title: "401-415. sayfalar, Cevşenü'l-Kebir 1-5", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_2", title: "416-430. sayfalar, Cevşenü'l-Kebir 6-10", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_3", title: "431-445. sayfalar, Cevşenü'l-Kebir 11-15", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_4", title: "446-460. sayfalar, Cevşenü'l-Kebir 16-20", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_5", title: "461-470. sayfalar, Cevşenü'l-Kebir 21-25", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_6", title: "471-485. sayfalar, Cevşenü'l-Kebir 26-30", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_7", title: "486-500. sayfalar, Cevşenü'l-Kebir 31-35", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_8", title: "501-515. sayfalar, Cevşenü'l-Kebir 36-41", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_9", title: "516-530. sayfalar, Evrad-ı Kudsiye 1-5", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_10", title: "531-545. sayfalar, Evrad-ı Kudsiye 6-10", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_11", title: "546-560. sayfalar, Evrad-ı Kudsiye 11-17", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_12", title: "561-573. sayfalar, Delailü'n-Nur 1-5", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_13", title: "574-586. sayfalar, Delailü'n-Nur 6-10", category: "Kur'ân-ı Kerim" },
            { id: "k4_kuran_14", title: "587-604. sayfalar, Delailü'n-Nur 11-16", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k4_mutalaa_1", title: "Lem'alar 1-50", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_2", title: "Lem'alar 51-100", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_3", title: "Lem'alar 101-150", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_4", title: "Lem'alar 151-200", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_5", title: "Lem'alar 201-250", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_6", title: "Lem'alar 251-300", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_7", title: "Lem'alar 301-325, 363-380", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_8", title: "Lem'alar 381-419", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_9", title: "Kastamonu Lahikası 1-50", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_10", title: "Kastamonu Lahikası 51-100", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_11", title: "Kastamonu Lahikası 101-160", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_12", title: "Kastamonu Lahikası 161-220", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_13", title: "Kastamonu Lahikası 221-280", category: "Risale-i Nur Mütalaası" },
            { id: "k4_mutalaa_14", title: "Kastamonu Lahikası 281-343", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k4_ezber_1", title: "Zilzal, Adiyat", category: "Ezber Çalışması" },
            { id: "k4_ezber_2", title: "Karia, Tekasür", category: "Ezber Çalışması" },
            { id: "k4_ezber_3", title: "Asr, Hümeze", category: "Ezber Çalışması" },
            { id: "k4_ezber_4", title: "İhlas Risalesi ilk 18 satır (ey kardeşlerim)e kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_5", title: "İhlas Risalesi ikinci 18 satırı (ey kardeşlerim)e kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_6", title: "İhlas Risalesi İkinci Düstur'un haşiyesine kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_7", title: "İhlas Risalesi Üçüncü Düstur'un yarısına kadar (bilirsiniz ki) ye kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_8", title: "İhlas Risalesi Dördüncü Düstur'a kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_9", title: "İhlas Risalesi rabıta-i mevte kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_10", title: "İhlas Risalesi ihlası kazanmanın ikinci sebebe kadar (tefekkür)", category: "Ezber Çalışması" },
            { id: "k4_ezber_11", title: "İhlas Risalesi ittifak misallerinin birinci misaline kadar (ehli dünya)", category: "Ezber Çalışması" },
            { id: "k4_ezber_12", title: "İhlas Risalesi birinci misalden ikinci misale kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_13", title: "İhlas Risalesi ikinci misalden ikinci maniye kadar", category: "Ezber Çalışması" },
            { id: "k4_ezber_14", title: "İhlas Risalesi ihlası kıran ikinci maniden sonuna kadar", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k4_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k4_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k4_kitap_1", title: "Peygamberimizin Hayatı Mekke 1-90", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_2", title: "Peygamberimizin Hayatı Mekke 90-180", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_3", title: "Peygamberimizin Hayatı Mekke 181-270", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_4", title: "Peygamberimizin Hayatı Mekke 271-360", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_5", title: "Peygamberimizin Hayatı Mekke 361-450", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_6", title: "Peygamberimizin Hayatı Mekke 450-536", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_7", title: "Peygamberimizin Hayatı Medine 1-90", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_8", title: "Peygamberimizin Hayatı Medine 91-180", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_9", title: "Peygamberimizin Hayatı Medine 181-270", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_10", title: "Peygamberimizin Hayatı Medine 270-360", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_11", title: "Peygamberimizin Hayatı Medine 361-450", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_12", title: "Peygamberimizin Hayatı Medine 451-540", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_13", title: "Peygamberimizin Hayatı Medine 541-630", category: "Okunacak Kitaplar" },
            { id: "k4_kitap_14", title: "Peygamberimizin Hayatı Medine 631-708", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k4_mutalaaverme_1", title: "21. Söz'ün 4. ikazına kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k4_mutalaaverme_2", title: "21. Söz'ün 4. ikazından sonrası", category: "Mütalaa Verme Çalışması" },
            { id: "k4_mutalaaverme_3", title: "23. Söz dördüncü noktaya kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k4_mutalaaverme_4", title: "23. Söz dördüncü noktadan sonrası", category: "Mütalaa Verme Çalışması" }
        ]
    },
    {
        level: 5,
        title: "5. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k5_kuran_1", title: "1. Cüz, Cevşen 1-10", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_2", title: "2. Cüz, Cevşen 11-20", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_3", title: "3. Cüz, Cevşen 21-30", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_4", title: "4. Cüz, Cevşen 31-41", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_5", title: "5. Cüz, Evrad-ı Kudsiye", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_6", title: "6. Cüz, Delailü'n-Nur", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_7", title: "7. Cüz, Sekine, İsm-i Azam Mertebesinde Dua, Münacat-ı Veysel Karani, Dua-yı İsm-i Azam, Tercüman-ı İsm-i Azam", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_8", title: "8. Cüz, Münacatü'l-Kur'ân 1-11", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_9", title: "9. Cüz, Münacatü'l-Kur'ân 12-22", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_10", title: "10. Cüz, Münacatü'l-Kur'ân 23-33", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_11", title: "11. Cüz, Tahmidiye", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_12", title: "12. Cüz, Hulasatü'l-Hulasa", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_13", title: "13. Cüz, Celcelütiyye", category: "Kur'ân-ı Kerim" },
            { id: "k5_kuran_14", title: "14 ve 15. Cüzler, Münacatlar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k5_mutalaa_1", title: "Sözler 1-50", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_2", title: "Sözler 51-100", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_3", title: "Sözler 101-150", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_4", title: "Sözler 151-200", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_5", title: "Sözler 201-250", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_6", title: "Sözler 251-300", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_7", title: "Sözler 301-340", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_8", title: "Sözler 341-379", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_9", title: "Şualar-1 1-40", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_10", title: "Şualar-1 41-80", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_11", title: "Şualar-1 81-120", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_12", title: "Şualar-1 121-160", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_13", title: "Şualar-1 161-200", category: "Risale-i Nur Mütalaası" },
            { id: "k5_mutalaa_14", title: "Şualar-1 201-262", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k5_ezber_1", title: "Duha, İnşirah", category: "Ezber Çalışması" },
            { id: "k5_ezber_2", title: "Tin, Alak", category: "Ezber Çalışması" },
            { id: "k5_ezber_3", title: "Kadir, Beyyine", category: "Ezber Çalışması" },
            { id: "k5_ezber_4", title: "Reşhalar (19. Söz) baştan Üçüncü Reşha'ya kadar", category: "Ezber Çalışması" },
            { id: "k5_ezber_5", title: "Reşhalar (19. Söz) 3, 4 ve 5. Reşhalar", category: "Ezber Çalışması" },
            { id: "k5_ezber_6", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_7", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_8", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_9", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_10", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_11", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_12", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_13", title: "Reşhalar (19. Söz)", category: "Ezber Çalışması" },
            { id: "k5_ezber_14", title: "Sefer Duası", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k5_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k5_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k5_kitap_1", title: "Tarihçe-i Hayat (1. Cild) 1-30", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_2", title: "Tarihçe-i Hayat (1. Cild) 31-60", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_3", title: "Tarihçe-i Hayat (1. Cild) 61-90", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_4", title: "Tarihçe-i Hayat (1. Cild) 91-120", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_5", title: "Tarihçe-i Hayat (1. Cild) 121-150", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_6", title: "Tarihçe-i Hayat (1. Cild) 151-180", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_7", title: "Tarihçe-i Hayat (1. Cild) 181-210", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_8", title: "Tarihçe-i Hayat (1. Cild) 211-240", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_9", title: "Tarihçe-i Hayat (1. Cild) 241-280", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_10", title: "Tarihçe-i Hayat (1. Cild) 281-320", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_11", title: "Tarihçe-i Hayat (1. Cild) 320-360", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_12", title: "Tarihçe-i Hayat (1. Cild) 360-400", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_13", title: "Tarihçe-i Hayat (1. Cild) 401-450", category: "Okunacak Kitaplar" },
            { id: "k5_kitap_14", title: "Tarihçe-i Hayat (1. Cild) 451-500", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k5_mutalaaverme_1", title: "19. Söz (Reşhalar) 13. Reşha'ya kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k5_mutalaaverme_2", title: "19. Söz (Reşhalar) 13. Reşha'dan sonuna kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k5_mutalaaverme_3", title: "Sünnet-i Seniye Risalesi 9. Nükte'ye kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k5_mutalaaverme_4", title: "Sünnet-i Seniye Risalesi 9. Nükte'den sonuna kadar", category: "Mütalaa Verme Çalışması" },

            { id: "k5_sehadetname_1", title: "Türkçe 3 Metin Çevirisi", category: "Şehadetname" },
            { id: "k5_sehadetname_2", title: "Türkçe Kavaid Ezberi", category: "Şehadetname" }
        ]
    },
    {
        level: 6,
        title: "6. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k6_kuran_1", title: "16. Cüz, Cevşen 1-10", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_2", title: "17. Cüz, Cevşen 11-20", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_3", title: "18. Cüz, Cevşen 21-30", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_4", title: "19. Cüz, Cevşen 31-41", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_5", title: "20. Cüz, Evrad-ı Kudsiye", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_6", title: "21. Cüz, Delailü'n-Nur", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_7", title: "22. Cüz, Sekine, İ. Azam Mer. Dua, Münacat-ı Veysel Karani, Dua-yı İsm-i Azam, Tercüman-ı İsm-i Azam", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_8", title: "23. Cüz, Münacatü'l-Kur'ân 1-11", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_9", title: "24. Cüz, Münacatü'l-Kur'ân 12-22", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_10", title: "25. Cüz, Münacatü'l-Kur'ân 23-33", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_11", title: "26. Cüz, Tahmidiye", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_12", title: "27. Cüz, Hulasatü'l-Hulasa", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_13", title: "28. Cüz, Celcelütiyye", category: "Kur'ân-ı Kerim" },
            { id: "k6_kuran_14", title: "29 ve 30. Cüzler, Münacatlar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k6_mutalaa_1", title: "Sikke-i Tasdik-i Gaybî 1-30", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_2", title: "Sikke-i Tasdik-i Gaybî 31-60", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_3", title: "Sikke-i Tasdik-i Gaybî 61-90", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_4", title: "Sikke-i Tasdik-i Gaybî 91-130", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_5", title: "Sikke-i Tasdik-i Gaybî 131-170", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_6", title: "Sikke-i Tasdik-i Gaybî 171-210", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_7", title: "Sikke-i Tasdik-i Gaybî 210-250", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_8", title: "Mektubat-2 273-310", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_9", title: "Mektubat-2 311-345", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_10", title: "Mektubat-2 346-380", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_11", title: "Mektubat-2 381-415", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_12", title: "Mektubat-2 416-450", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_13", title: "Mektubat-2 451-480", category: "Risale-i Nur Mütalaası" },
            { id: "k6_mutalaa_14", title: "Mektubat-2 481-515", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k6_ezber_1", title: "Yâsin Suresi'nin 1. sayfası", category: "Ezber Çalışması" },
            { id: "k6_ezber_2", title: "Yâsin Suresi'nin 2. sayfası", category: "Ezber Çalışması" },
            { id: "k6_ezber_3", title: "Yâsin Suresi'nin 3. sayfası", category: "Ezber Çalışması" },
            { id: "k6_ezber_4", title: "Tabiat Risalesi baştan besmeleye kadar (haşiye dahil)", category: "Ezber Çalışması" },
            { id: "k6_ezber_5", title: "Tabiat Risalesi besmeleden mukaddimeye kadar", category: "Ezber Çalışması" },
            { id: "k6_ezber_6", title: "Tabiat Risalesi mukaddime", category: "Ezber Çalışması" },
            { id: "k6_ezber_7", title: "Tabiat Risalesi birinci yoldan elhasıla kadar", category: "Ezber Çalışması" },
            { id: "k6_ezber_8", title: "Tabiat Risalesi elhasıl ve ikinci muhal", category: "Ezber Çalışması" },
            { id: "k6_ezber_9", title: "Tabiat Risalesi üçüncü muhal", category: "Ezber Çalışması" },
            { id: "k6_ezber_10", title: "Tabiat Risalesi ikinci meseleden ikinci meselenin ikinci muhaline kadar", category: "Ezber Çalışması" },
            { id: "k6_ezber_11", title: "Tabiat Risalesi ikinci meselenin ikinci muhali", category: "Ezber Çalışması" },
            { id: "k6_ezber_12", title: "Tabiat Risalesi ikinci meselenin üçüncü muhali", category: "Ezber Çalışması" },
            { id: "k6_ezber_13", title: "Tabiat Risalesi üçüncü kelimeden üçüncü kelimenin ikinci muhaline kadar", category: "Ezber Çalışması" },
            { id: "k6_ezber_14", title: "Tesbihat-ı İmam-ı Azam", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k6_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k6_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k6_kitap_1", title: "Tarihçe-i Hayat (2. Cild) 1-30", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_2", title: "Tarihçe-i Hayat (2. Cild) 31-60", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_3", title: "Tarihçe-i Hayat (2. Cild) 61-90", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_4", title: "Tarihçe-i Hayat (2. Cild) 91-120", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_5", title: "Tarihçe-i Hayat (2. Cild) 121-150", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_6", title: "Tarihçe-i Hayat (2. Cild) 151-180", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_7", title: "Tarihçe-i Hayat (2. Cild) 181-210", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_8", title: "Tarihçe-i Hayat (2. Cild) 211-240", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_9", title: "Tarihçe-i Hayat (2. Cild) 241-280", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_10", title: "Tarihçe-i Hayat (2. Cild) 281-320", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_11", title: "Tarihçe-i Hayat (2. Cild) 320-360", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_12", title: "Tarihçe-i Hayat (2. Cild) 360-400", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_13", title: "Tarihçe-i Hayat (2. Cild) 401-460", category: "Okunacak Kitaplar" },
            { id: "k6_kitap_14", title: "Tarihçe-i Hayat (2. Cild) 461-529", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k6_mutalaaverme_1", title: "Asa-yı Musa'dan 6. Mesele", category: "Mütalaa Verme Çalışması" },
            { id: "k6_mutalaaverme_2", title: "29. Mektup Hücûmat-ı Sitte baştan 3. Desise'ye kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k6_mutalaaverme_3", title: "29. Mektup Hücûmat-ı Sitte 3 ve 4. Desiseler", category: "Mütalaa Verme Çalışması" },
            { id: "k6_mutalaaverme_4", title: "29. Mektup Hücûmat-ı Sitte 5. Desise'den sona kadar", category: "Mütalaa Verme Çalışması" }
        ]
    },
    {
        level: 7,
        title: "7. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k7_kuran_1", title: "1. Cüz, Cevşen 1-10", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_2", title: "2. Cüz, Cevşen 11-20", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_3", title: "3. Cüz, Cevşen 21-30", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_4", title: "4. Cüz, Cevşen 31-41", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_5", title: "5. Cüz, Evrad-ı Kudsiye", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_6", title: "6. Cüz, Delailü'n-Nur", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_7", title: "7. Cüz, Sekine, İ. Azam Mer. Dua, Münacat-ı Veysel Karani, Dua-yı İsm-i Azam, Tercüman-ı İsm-i Azam", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_8", title: "8. Cüz, Münacatü'l-Kur'ân 1-11", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_9", title: "9. Cüz, Münacatü'l-Kur'ân 12-22", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_10", title: "10. Cüz, Münacatü'l-Kur'ân 23-33", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_11", title: "11. Cüz, Tahmidiye", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_12", title: "12. Cüz, Hulasatü'l-Hulasa", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_13", title: "13. Cüz, Celcelütiyye", category: "Kur'ân-ı Kerim" },
            { id: "k7_kuran_14", title: "14 ve 15. Cüzler, Münacatlar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k7_mutalaa_1", title: "Barla Lahikası 1-50", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_2", title: "Barla Lahikası 51-100", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_3", title: "Barla Lahikası 101-150", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_4", title: "Barla Lahikası 151-200", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_5", title: "Barla Lahikası 201-250", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_6", title: "Barla Lahikası 251-300", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_7", title: "Barla Lahikası 301-368", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_8", title: "Zülfikar 1-50", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_9", title: "Zülfikar 51-100", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_10", title: "Zülfikar 101-150", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_11", title: "Zülfikar 151-200", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_12", title: "Zülfikar 201-250", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_13", title: "Zülfikar 251-300", category: "Risale-i Nur Mütalaası" },
            { id: "k7_mutalaa_14", title: "Zülfikar 301-375", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k7_ezber_1", title: "Yâsin Suresi'nin 4. sayfası", category: "Ezber Çalışması" },
            { id: "k7_ezber_2", title: "Yâsin Suresi'nin 5. sayfası", category: "Ezber Çalışması" },
            { id: "k7_ezber_3", title: "Yâsin Suresi'nin 6. sayfası", category: "Ezber Çalışması" },
            { id: "k7_ezber_4", title: "Tabiat Risalesi 3. Kelime'nin 2. muhalinden eğer desene kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_5", title: "Tabiat Risalesi eğer desenden müşkilata kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_6", title: "Tabiat Risalesi müşkilattan 3. meselenin 3. muhaline kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_7", title: "Tabiat Risalesi 3. Mesele'nin 3. muhalinin 1. misali", category: "Ezber Çalışması" },
            { id: "k7_ezber_8", title: "Tabiat Risalesi 3. Mesele'nin 3. muhalinin 2. misalinden elhasıla (tabiiyyun) kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_9", title: "Tabiat Risalesi el-hasıldan (tabiiyyun) acaba bir saatçiye kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_10", title: "Tabiat Risalesi acabadan elcevaba kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_11", title: "Tabiat Risalesi el-cevaptan elhamdülillah alel imana kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_12", title: "Tabiat Risalesi elhamdülillah alel imandan ikinci şık şüpheye kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_13", title: "Tabiat Risalesi ikinci şık şüpheden sona kadar", category: "Ezber Çalışması" },
            { id: "k7_ezber_14", title: "Kabristan Duası", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k7_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k7_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k7_kitap_1", title: "Tarihçe-i Hayat (3. Cild) 1-30", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_2", title: "Tarihçe-i Hayat (3. Cild) 31-60", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_3", title: "Tarihçe-i Hayat (3. Cild) 61-90", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_4", title: "Tarihçe-i Hayat (3. Cild) 91-120", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_5", title: "Tarihçe-i Hayat (3. Cild) 121-150", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_6", title: "Tarihçe-i Hayat (3. Cild) 151-180", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_7", title: "Tarihçe-i Hayat (3. Cild) 181-210", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_8", title: "Tarihçe-i Hayat (3. Cild) 211-240", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_9", title: "Tarihçe-i Hayat (3. Cild) 241-280", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_10", title: "Tarihçe-i Hayat (3. Cild) 281-320", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_11", title: "Tarihçe-i Hayat (3. Cild) 320-360", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_12", title: "Tarihçe-i Hayat (3. Cild) 360-400", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_13", title: "Tarihçe-i Hayat (3. Cild) 401-450", category: "Okunacak Kitaplar" },
            { id: "k7_kitap_14", title: "Tarihçe-i Hayat (3. Cild) 451-503", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k7_mutalaaverme_1", title: "22. Mektup 5. Vecih'e kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k7_mutalaaverme_2", title: "22. Mektup 5. Vecih'e kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k7_mutalaaverme_3", title: "22. Mektup hatime", category: "Mütalaa Verme Çalışması" },
            { id: "k7_mutalaaverme_4", title: "Şükür Risalesi", category: "Mütalaa Verme Çalışması" },

            { id: "k6_sehadetname_1", title: "Arapça 3 Metin Çevirisi", category: "Şehadetname" },
            { id: "k6_sehadetname_2", title: "Arapça Kavaid Ezberi", category: "Şehadetname" }
        ]
    },
    {
        level: 8,
        title: "8. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k8_kuran_1", title: "16. Cüz, Cevşen 1-10", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_2", title: "17. Cüz, Cevşen 11-20", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_3", title: "18. Cüz, Cevşen 21-30", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_4", title: "19. Cüz, Cevşen 31-41", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_5", title: "20. Cüz, Evrad-ı Kudsiye", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_6", title: "21. Cüz, Delailü'n-Nur", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_7", title: "22. Cüz, Sekine, İ. Azam Mer. Dua, Münacat-ı Veysel Karani, Dua-yı İsm-i Azam, Tercüman-ı İsm-i Azam", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_8", title: "23. Cüz, Münacatü'l-Kur'ân 1-11", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_9", title: "24. Cüz, Münacatü'l-Kur'ân 12-22", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_10", title: "25. Cüz, Münacatü'l-Kur'ân 23-33", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_11", title: "26. Cüz, Tahmidiye", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_12", title: "27. Cüz, Hulasatü'l-Hulasa", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_13", title: "28. Cüz, Celcelütiyye", category: "Kur'ân-ı Kerim" },
            { id: "k8_kuran_14", title: "29 ve 30. Cüzler, Münacatlar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k8_mutalaa_1", title: "Emirdağ Lahikası-1 1-40", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_2", title: "Emirdağ Lahikası-1 41-80", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_3", title: "Emirdağ Lahikası-1 81-120", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_4", title: "Emirdağ Lahikası-1 121-160", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_5", title: "Emirdağ Lahikası-1 161-200", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_6", title: "Emirdağ Lahikası-1 201-236", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_7", title: "İşârâtü'l-İ'câz 1-35", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_8", title: "İşârâtü'l-İ'câz 36-70", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_9", title: "İşârâtü'l-İ'câz 71-105", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_10", title: "İşârâtü'l-İ'câz 106-140", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_11", title: "İşârâtü'l-İ'câz 141-175", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_12", title: "İşârâtü'l-İ'câz 176-210", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_13", title: "İşârâtü'l-İ'câz 211-245", category: "Risale-i Nur Mütalaası" },
            { id: "k8_mutalaa_14", title: "İşârâtü'l-İ'câz 246-284", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k8_ezber_1", title: "A'la Suresi", category: "Ezber Çalışması" },
            { id: "k8_ezber_2", title: "Bakara Suresi 153-157. ayetler", category: "Ezber Çalışması" },
            { id: "k8_ezber_3", title: "Al-i İmran 16-19. ayetler", category: "Ezber Çalışması" },
            { id: "k8_ezber_4", title: "Al-i İmran 25-27. ayetler", category: "Ezber Çalışması" },
            { id: "k8_ezber_5", title: "İhlas Risalesi ilk 18 satır (ey kardeşlerim)e kadar", category: "Ezber Çalışması" },
            { id: "k8_ezber_6", title: "İhlas Risalesi ikinci 18 satırı (ey kardeşlerim)e kadar", category: "Ezber Çalışması" },
            { id: "k8_ezber_7", title: "İhlas Risalesi İkinci Düstur'un haşiyesine kadar", category: "Ezber Çalışması" },
            { id: "k8_ezber_8", title: "İhlas Risalesi Üçüncü Düstur'un yarısına kadar (bilirsiniz ki) ye kadar", category: "Ezber Çalışması" },
            { id: "k8_ezber_9", title: "İhlas Risalesi Dördüncü Düstur'a kadar", category: "Ezber Çalışması" },
            { id: "k8_ezber_10", title: "İhlas Risalesi rabıta-i mevte kadar", category: "Ezber Çalışması" },
            { id: "k8_ezber_11", title: "İhlas Risalesi ihlası kazanmanın ikinci sebebe kadar (tefekkür)", category: "Ezber Çalışması" },
            { id: "k8_ezber_12", title: "İhlas Risalesi ittifak misallerinin birinci misaline kadar (ehl-i dünya)", category: "Ezber Çalışması" },
            { id: "k8_ezber_13", title: "İhlas Risalesi birinci misalden ikinci misale kadar", category: "Ezber Çalışması" },
            { id: "k8_ezber_14", title: "İhlas Risalesi ikinci misalden sonuna kadar", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k8_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k8_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k8_kitap_1", title: "Metinsiz Kur'ân Meali 1-40", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_2", title: "Metinsiz Kur'ân Meali 41-80", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_3", title: "Metinsiz Kur'ân Meali 81-120", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_4", title: "Metinsiz Kur'ân Meali 121-160", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_5", title: "Metinsiz Kur'ân Meali 161-200", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_6", title: "Metinsiz Kur'ân Meali 201-240", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_7", title: "Metinsiz Kur'ân Meali 241-280", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_8", title: "Metinsiz Kur'ân Meali 281-320", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_9", title: "Metinsiz Kur'ân Meali 321-360", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_10", title: "Metinsiz Kur'ân Meali 361-400", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_11", title: "Metinsiz Kur'ân Meali 401-450", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_12", title: "Metinsiz Kur'ân Meali 451-500", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_13", title: "Metinsiz Kur'ân Meali 501-550", category: "Okunacak Kitaplar" },
            { id: "k8_kitap_14", title: "Metinsiz Kur'ân Meali 551-604", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k8_mutalaaverme_1", title: "Tabiat Risalesi baştan üçüncü kelimeye kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k8_mutalaaverme_2", title: "Tabiat Risalesi üçüncü kelimeden üçüncü kelimenin üçüncü muhaline kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k8_mutalaaverme_3", title: "Tabiat Risalesi üçüncü kelimenin üçüncü muhalinden sonuna kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k8_mutalaaverme_4", title: "12. Mektub", category: "Mütalaa Verme Çalışması" }
        ]
    },
    {
        level: 9,
        title: "9. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k9_kuran_1", title: "1. Cüz, Cevşen 1-10", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_2", title: "2. Cüz, Cevşen 11-20", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_3", title: "3. Cüz, Cevşen 21-30", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_4", title: "4. Cüz, Cevşen 31-41", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_5", title: "5. Cüz, Evrad-ı Kudsiye", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_6", title: "6. Cüz, Delailü'n-Nur", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_7", title: "7. Cüz, Sekine, İ. Azam Mer. Dua, Münacat-ı Veysel Karani, Dua-yı İsm-i Azam, Tercüman-ı İsm-i Azam", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_8", title: "8. Cüz, Münacatü'l-Kur'ân 1-11", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_9", title: "9. Cüz, Münacatü'l-Kur'ân 12-22", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_10", title: "10. Cüz, Münacatü'l-Kur'ân 23-33", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_11", title: "11. Cüz, Tahmidiye", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_12", title: "12. Cüz, Hulasatü'l-Hulasa", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_13", title: "13. Cüz, Celcelütiyye", category: "Kur'ân-ı Kerim" },
            { id: "k9_kuran_14", title: "14 ve 15. Cüzler, Münacatlar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k9_mutalaa_1", title: "Emirdağ Lahikası-2 1-30", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_2", title: "Emirdağ Lahikası-2 31-60", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_3", title: "Emirdağ Lahikası-2 61-90", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_4", title: "Emirdağ Lahikası-2 91-120", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_5", title: "Emirdağ Lahikası-2 121-150", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_6", title: "Emirdağ Lahikası-2 151-180", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_7", title: "Emirdağ Lahikası-2 181-210", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_8", title: "Emirdağ Lahikası-2 211-236", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_9", title: "Tısımlar 1-25", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_10", title: "Tısımlar 26-50", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_11", title: "Tısımlar 51-75", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_12", title: "Tısımlar 76-100", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_13", title: "Tısımlar 101-130", category: "Risale-i Nur Mütalaası" },
            { id: "k9_mutalaa_14", title: "Tısımlar 131-164", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k9_ezber_1", title: "Âl-i İmran 191-194. ayetleri", category: "Ezber Çalışması" },
            { id: "k9_ezber_2", title: "Âl-i İmran 191-194. ayetleri", category: "Ezber Çalışması" },
            { id: "k9_ezber_3", title: "Âl-i İmran 191-194. ayetleri", category: "Ezber Çalışması" },
            { id: "k9_ezber_4", title: "İsra 110-111. ayetler", category: "Ezber Çalışması" },
            { id: "k9_ezber_5", title: "Kehf 107-110. ayetler", category: "Ezber Çalışması" },
            { id: "k9_ezber_6", title: "Tevbe 127-129. ayetler", category: "Ezber Çalışması" },
            { id: "k9_ezber_7", title: "Onuncu Huccet-i İmaniye 1. kelimeye kadar", category: "Ezber Çalışması" },
            { id: "k9_ezber_8", title: "Onuncu Huccet-i İmaniye 1, 2 ve 3. kelimeler", category: "Ezber Çalışması" },
            { id: "k9_ezber_9", title: "Onuncu Huccet-i İmaniye 4 ve 5. kelimeler", category: "Ezber Çalışması" },
            { id: "k9_ezber_10", title: "Onuncu Huccet-i İmaniye 6 ve 7. kelimeler", category: "Ezber Çalışması" },
            { id: "k9_ezber_11", title: "Onuncu Huccet-i İmaniye 8. kelimeler", category: "Ezber Çalışması" },
            { id: "k9_ezber_12", title: "Onuncu Huccet-i İmaniye 9. kelimeler", category: "Ezber Çalışması" },
            { id: "k9_ezber_13", title: "Onuncu Huccet-i İmaniye 10. kelimeler", category: "Ezber Çalışması" },
            { id: "k9_ezber_14", title: "Onuncu Huccet-i İmaniye 11. kelimeler", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k9_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k9_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k9_kitap_1", title: "Peygamberler Tarihi (A. Köksal) 1-25", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_2", title: "Peygamberler Tarihi (A. Köksal) 26-50", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_3", title: "Peygamberler Tarihi (A. Köksal) 51-75", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_4", title: "Peygamberler Tarihi (A. Köksal) 76-100", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_5", title: "Peygamberler Tarihi (A. Köksal) 101-125", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_6", title: "Peygamberler Tarihi (A. Köksal) 126-150", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_7", title: "Peygamberler Tarihi (A. Köksal) 151-175", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_8", title: "Peygamberler Tarihi (A. Köksal) 176-200", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_9", title: "Peygamberler Tarihi (A. Köksal) 201-225", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_10", title: "Peygamberler Tarihi (A. Köksal) 226-250", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_11", title: "Peygamberler Tarihi (A. Köksal) 251-275", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_12", title: "Peygamberler Tarihi (A. Köksal) 276-300", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_13", title: "Peygamberler Tarihi (A. Köksal) 301-325", category: "Okunacak Kitaplar" },
            { id: "k9_kitap_14", title: "Peygamberler Tarihi (A. Köksal) 325-354", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k9_mutalaaverme_1", title: "Mucizat-ı Enbiya (20. Söz 2. makamı Zülfikar 159-161 (heme kadar))", category: "Mütalaa Verme Çalışması" },
            { id: "k9_mutalaaverme_2", title: "Mucizat-ı Enbiya (20. Söz 2. makamı Zülfikar 161-164 (ikinci heme kadar))", category: "Mütalaa Verme Çalışması" },
            { id: "k9_mutalaaverme_3", title: "Mucizat-ı Enbiya (20. Söz 2. makamı Zülfikar 164-166 (heme kadar))", category: "Mütalaa Verme Çalışması" },
            { id: "k9_mutalaaverme_4", title: "Mucizat-ı Enbiya (20. Söz 2. makamı Zülfikar 166'dan 169 sonuna kadar)", category: "Mütalaa Verme Çalışması" }
        ]
    },
    {
        level: 10,
        title: "10. Kur Programı",
        tasks: [
            // Kur'ân-ı Kerim
            { id: "k10_kuran_1", title: "16. Cüz, Cevşen 1-10", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_2", title: "17. Cüz, Cevşen 11-20", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_3", title: "18. Cüz, Cevşen 21-30", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_4", title: "19. Cüz, Cevşen 31-41", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_5", title: "20. Cüz, Evrad-ı Kudsiye", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_6", title: "21. Cüz, Delailü'n-Nur", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_7", title: "22. Cüz, Sekine, İ. Azam Mer. Dua, Münacat-ı Veysel Karani, Dua-yı İsm-i Azam, Tercüman-ı İsm-i Azam", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_8", title: "23. Cüz, Münacatü'l-Kur'ân 1-11", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_9", title: "24. Cüz, Münacatü'l-Kur'ân 12-22", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_10", title: "25. Cüz, Münacatü'l-Kur'ân 23-33", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_11", title: "26. Cüz, Tahmidiye", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_12", title: "27. Cüz, Hulasatü'l-Hulasa", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_13", title: "28. Cüz, Celcelütiyye", category: "Kur'ân-ı Kerim" },
            { id: "k10_kuran_14", title: "29 ve 30. Cüzler, Münacatlar", category: "Kur'ân-ı Kerim" },

            // Risale-i Nur Mütalaası
            { id: "k10_mutalaa_1", title: "Sikke-i Tasdik-i Gaybî 1-30", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_2", title: "Sikke-i Tasdik-i Gaybî 3-60", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_3", title: "Sikke-i Tasdik-i Gaybî 61-90", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_4", title: "Sikke-i Tasdik-i Gaybî 91-130", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_5", title: "Sikke-i Tasdik-i Gaybî 131-170", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_6", title: "Sikke-i Tasdik-i Gaybî 171-210", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_7", title: "Sikke-i Tasdik-i Gaybî 210-250", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_8", title: "Mektubat-2 273-310", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_9", title: "Mektubat-2 311-345", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_10", title: "Mektubat-2 346-380", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_11", title: "Mektubat-2 381-415", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_12", title: "Mektubat-2 416-450", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_13", title: "Mektubat-2 451-480", category: "Risale-i Nur Mütalaası" },
            { id: "k10_mutalaa_14", title: "Mektubat-2 481-515", category: "Risale-i Nur Mütalaası" },

            // Ezber Çalışması
            { id: "k10_ezber_1", title: "Mülk Suresi 1-4. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_2", title: "Mülk Suresi 5-8. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_3", title: "Mülk Suresi 9-12. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_4", title: "Mülk Suresi 13-16. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_5", title: "Mülk Suresi 17-19. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_6", title: "Mülk Suresi 20-22. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_7", title: "Mülk Suresi 23-27. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_8", title: "Mülk Suresi 28-30. ayetler", category: "Ezber Çalışması" },
            { id: "k10_ezber_9", title: "6. Hüccet-i İmaniye 1. sayfası", category: "Ezber Çalışması" },
            { id: "k10_ezber_10", title: "6. Hüccet-i İmaniye 2. sayfası", category: "Ezber Çalışması" },
            { id: "k10_ezber_11", title: "6. Hüccet-i İmaniye 3. sayfası", category: "Ezber Çalışması" },
            { id: "k10_ezber_12", title: "6. Hüccet-i İmaniye 4. sayfası", category: "Ezber Çalışması" },
            { id: "k10_ezber_13", title: "6. Hüccet-i İmaniye 5. sayfası", category: "Ezber Çalışması" },
            { id: "k10_ezber_14", title: "6. Hüccet-i İmaniye 6. sayfası", category: "Ezber Çalışması" },

            // Yazı Çalışması
            { id: "k10_yazi_1", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_2", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_3", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_4", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_5", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_6", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_7", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_8", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_9", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_10", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_11", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_12", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_13", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },
            { id: "k10_yazi_14", title: "Asa-yı Musa 3,5 sayfa", category: "Yazı Çalışması" },

            // Okunacak Kitaplar
            { id: "k10_kitap_1", title: "Hizmetkar Liderlik 1-25", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_2", title: "Hizmetkar Liderlik 26-50", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_3", title: "Hizmetkar Liderlik 51-75", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_4", title: "Hizmetkar Liderlik 76-100", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_5", title: "Hizmetkar Liderlik 101-125", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_6", title: "Hizmetkar Liderlik 126-150", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_7", title: "Hizmetkar Liderlik 151-175", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_8", title: "Hizmetkar Liderlik 176-200", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_9", title: "Hizmetkar Liderlik 201-225", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_10", title: "Hizmetkar Liderlik 225-250", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_11", title: "Hizmetkar Liderlik 251-280", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_12", title: "İslam Alimlerin Gözünde Zaman Değeri (Ebu Gudde) 1-35", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_13", title: "İslam Alimlerin Gözünde Zaman Değeri (Ebu Gudde) 36-70", category: "Okunacak Kitaplar" },
            { id: "k10_kitap_14", title: "İslam Alimlerin Gözünde Zaman Değeri (Ebu Gudde) 71-109", category: "Okunacak Kitaplar" },

            // Mütalaa Verme Çalışması
            { id: "k10_mutalaaverme_1", title: "Kader Risalesi baştan ikinci mebhasa kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k10_mutalaaverme_2", title: "Kader Risalesi ikinci mebhastan netice-i merama kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k10_mutalaaverme_3", title: "Kader Risalesi netice-i meramdan sona kadar", category: "Mütalaa Verme Çalışması" },
            { id: "k10_mutalaaverme_4", title: "17. Söz'ün Zeyli", category: "Mütalaa Verme Çalışması" }
        ]
    }
];

export function renderCurriculumTab() {
    const currentCourse = STATIC_CURRICULUM.find(c => c.level === window.selectedCourseLevel) || STATIC_CURRICULUM[0];

    const groupedTasks = {};
    currentCourse.tasks.forEach(item => {
        if (!groupedTasks[item.category]) {
            groupedTasks[item.category] = [];
        }
        groupedTasks[item.category].push(item);
    });

    const categoryStyles = {
        "Kur'ân-ı Kerim": { icon: '📖', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        "Risale-i Nur Mütalaası": { icon: '📚', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', badge: 'bg-sky-100 text-sky-800 border-sky-300' },
        "Yazı Çalışması": { icon: '📜', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
        "Ezber Çalışması": { icon: '🎙️', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
        "Okunacak Kitaplar": { icon: '📖', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
        "Mütalaa Verme Çalışması": { icon: '📝', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', badge: 'bg-pink-100 text-pink-800 border-pink-300' },
        "Şehadetname": { icon: '✒️', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', badge: 'bg-rose-100 text-rose-800 border-rose-300' },
        "Özel": { icon: '✨', bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-800', badge: 'bg-stone-200 text-stone-800 border-stone-300' }
    };

    const CATEGORY_OPTIONS = [
        "Kur'ân-ı Kerim",
        "Risale-i Nur Mütalaası",
        "Ezber Çalışması",
        "Yazı Çalışması",
        "Okunacak Kitaplar",
        "Mütalaa Verme Çalışması",
        "Şehadetname",
        "Özel"
    ];

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 shadow-sm flex justify-between items-center gap-4">
                <div>
                    <h2 class="text-xl font-black text-slate-800">📖 Kurlar Listesi</h2>
                    <p class="text-xs text-slate-500 font-medium">Vazifelerinizi programınıza ekleyin.</p>
                </div>
                <button onclick="toggleCurriculumInfoModal()" class="px-4 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-800 border-2 border-sky-300 border-b-4 border-b-sky-400 rounded-2xl text-xs font-black transition-all shadow-sm flex items-center gap-2 shrink-0 active:translate-y-0.5">
                    <span>ℹ️</span> Yönerge & Düsturlar
                </button>
            </div>

            ${window.showCurriculumInfoModal ? `
                <div class="bg-sky-50 border-2 border-sky-300 border-b-4 border-b-sky-400 rounded-3xl p-6 md:p-8 space-y-6 animate-fadeIn shadow-md">
                    <div class="flex justify-between items-center border-b-2 border-sky-200 pb-3">
                        <h3 class="text-base font-black text-sky-950 flex items-center gap-2">
                            <span>📜</span> Medrese İhtisas Programı Umumi Düsturlar ve Yönerge
                        </h3>
                    </div>

                    <div class="space-y-4 text-xs text-sky-900 font-medium leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                        
                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <p class="font-black text-sky-950 text-sm">BU KUR LİSTESİ HAFTALIK VAZİFELERİ İÇİN HAZIRLANMIŞTIR. İLERLEYEN SÜREÇTE GÜNLÜK VAZİFELER OLARAK GÜNCELLENECEKTİR.</p>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Umumi Düsturlar</h4>
                            <ul class="list-disc pl-4 space-y-1">
                                1. Her bir kur, bir egitim yilinin yari doneminde bitebilecek sekilde hazirlanmistir.<br>
                                2. Her kuru donem sonuna kadar bitirmek esas olmakla birlikte, donem icinde bitirilemeyen kisimlar yaz ve kis calismalari ile tatil donemleri icinde tamamlanacaktir.<br>
                                3. Kurdaki bazi maddeleri vaktinden once bitirenler, o kisim icin bir ust kura gecebilirler.<br>
                                4. Donemlik kur hedefleri, hazirlanan aylik ve haftalik tablolardan da takip edilebilecektir.<br>
                                5. Hangi bolumde gunluk ne kadar calisma yapilirsa hedeflerin yetisecegine dair bilgiler ilgili tablodan ogrenilecektir.<br>
                                6. Tum bolumler 4 ay uzerinden planlanmisken yazi maddesi 6 ay uzerinden hesaplanmistir. Buna gore gunde yarim sayfa (11 satir) yazan kimse planlanan hedefe 6 ayda biiznillah ulasmis olacaktir.<br>
                                7. Kurlar tamamlanirken en fazla bir ust kurdan bolumler alinabilir.<br>
                                8. Her bir kuru tamamlayanlara bitirme sertifikasi verilecektir.<br>
                                9. 10 kurun tamamini bitirenlere ise icazetname (diploma) verilecektir.
                            </ul>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Kur'an-ı Kerim Bölümü</h4>
                            <ul class="list-disc pl-4 space-y-1">
                                1. Kuran ve tecvid egitimi bolumu bitiminde imtihan yapilmayacak, talebenin hatasiz Kuran okur seviyeye gelmis olmasi dikkate alinacaktir.<br>
                                2. Birinci kurda okunmasi gereken 3 cuz, hoca nezaretinde okutulmalidir.<br>
                                3. Cuma geceleri, birlikte veya munferiden (Persembe gunu aksami) Yasin-i Serif okunacaktir.<br>
                                4. Imam ve muezzin gibi kiraat dersi verebilecek hocalar tarafindan talebelere kiraat talimi gordurulmelidir.<br>
                                5. Kuran okumanin fazileti, Kuranin tarihcesi, kiraat, talim, meharic-i huruf, tecvid, kiraat-i asere gibi temel kavramlar hakkinda talebelere bilgi verilmelidir.<br>
                                6. Gorsel ve isitsel materyallerden istifade edilmelidir.<br>
                                7. Temel seviyede kiraat talim ve tecvid derslerinden sonra, istidatli ve istekli olanlar makam dersleri almaya tesvik edilmelidir.<br>
                                8. Kuran tilavetinde hizdan ziyade dogru okumak esas olmakla birlikte, talebe bir sahifeyi ideal olarak ortalama 2 dakikada okuyabilir seviyeye gelmelidir.<br>
                                9. Imamlik ve muezzinlik egitimi geciktirilmeden verilip, namazlarda firsat verilip kendini yetistirmesi saglanmalidir.<br>
                                10. Duzenli Kuran okumayi temin edebilmek icin cesitli zamanlarda tesvik ve telkinlerde bulunulmali, talebe kesinlikle hatim programlarina dahil edilmelidir.<br>
                                11. Kuran ezberlerinin muhafazasini temin icin bunlarin hem ferdi kilinan namazlarda, hem de imamete gecerek okunmasi tesvik edilmelidir.
                            </ul>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Risale-i Nur Mütalaa Bölümü</h4>
                            <ul class="list-disc pl-4 space-y-1">
                               1. Osmanlıca eğitime başlarken yeni hazırlanan Usûl esas alınacaktır. Hususan, Birinci Söz'ün her bir satırı yirmişer defa okunup yazılmalı ve ezber edilmeli kaidesi mutlaka uygulanmalıdır.<br>
                                2. Yeni gelen talebenin birinci senenin sonuna kadar, risaleleri, tecrübeli birinin nezaretinde anlayarak mütalaa etmesine dikkat edilmelidir.<br>
                                3. Kat vakıfları ile tecrübeli talebeler, yeni olanlara mütalaa usûlünü bizzat tatbik ederek göstermelidir.<br>
                                4. Yeni talebelerin okumayı hızlandırmaları için, program haricinde de ayrıyeten okuma çalışmaları yapmaları dikkat edilmesi gereken çok önemli bir husustur.<br>
                                5. Mütalaa yapılacak yerler, anlayarak okunmalı, sayfa kenarındaki lügatlerden muhakkak faydalanılmalıdır. Anlaşılmayan yerler not edilerek bilenlere sorulmalıdır.<br>
                                6. Okuma hızının, 3. kurun başlangıcında, bir sayfayı 5 dakikada okuyabilecek seviyeye gelmesi hedeflenmelidir.<br>
                                7. Okul ve ders durumlarına göre müsait olan kardeşlerin, kurlarda belirtilen sınırlara bağlı kalmaksızın daha fazla mütalaa yapmaları teşvik ve tavsiye edilmelidir. Bunu temin için sene boyunca periyodik olarak okuma kampanyaları düzenleyerek, mükâfat ve hediyelerle talebeler teşvik edilmelidir. Herhangi bir eser mütalaa edilmeden önce fihrist kısmı öncelikle okunmalıdır.<br>
                                8. Herhangi bir eser mütalaa edilmeden önce fihrist kısmı okunmalıdır.<br>
                                9. Talebenin risaleler hakkında fihristik malumat sahibi olmasını sağlamak için, mütalaa boyunca ve sonrasında fihrist çıkarma, soru-cevap, lügat-ıstılah bilgisi, fihrist imtihanı gibi çalışmalar yapılmalıdır.<br>
                                10. Mütalaalar mümkün mertebe not almak suretiyle yapılmalı. Hususan tespit edilen bazı güzel cümleler ve nükter kaydedilmelidir.<br>
                                11. Mütalaaların sağlıklı bir şekilde yapılabilmesi için her kardeşin okuyacağı kitabı temin etmesi ve mümkünse kendi kitabı üzerinden mütalaa yapması tavsiye edilmelidir.<br>
                                12. Talebenin okuma esnasında önemli gördüğü yerleri, anlamadığı yerleri renkli kalemlerle işaretlemesi tavsiye edilmelidir. Bu işaretlemelerin, sonraki okumalarda çok faydalı olacağı kendilerine belirtilmelidir.<br>
                                13. Mütalaalarda anlamayı arttıran ve daha zevkli hale getiren unsurlardan birisi de grup mütalaalarıdır. Bu konuda hafta sonları, resmi tatil günleri bir fırsat olarak değerlendirilmeli vakfın veya yetişkin bir kardeşin başkanlığında grup mütalaası yapılmalıdır. Lakin grup mütalaaları tek bir kişinin konuştuğu ders ortamına dönmemelidir.<br>
                                14. İdeal olarak 4-5 kişiden oluşan bu gruplarda talebe kardeşlerin seviyelerine göre konular seçilmeli ve kardeşlerin istidatlarını ve özgüvenlerini geliştirmek için mütalaaya aktif katılımları sağlanıp bu ortak faaliyetten tefeyyüz etmeleri hedeflenmelidir. Yine dönem içinde başka şehirlerden seviyesi yakın talebelerin katılımıyla grup mütalaası çalışmaları planlanabilir.<br>
                                15. Yaz ve kış çalışmalarında toplu bir müzakere saati belirlenerek, her talebenin günlük mütalaasından çıkardığı bir hakikati, soru cevap eşliğinde paylaşması sağlanmalıdır. Bu çalışma toplum önünde kardeşlerin irticali konuşma kabiliyetlerini geliştirip hakikatleri savunabilme becerisini inkişaf ettirecektir.<br>
                                16. Talebenin yetişme seviyesini derinleştirmek için kendilerine ilmî mütalaa ve araştırma konuları verilebilir.<br>
                                17. Talebeyi yetiştirmeye yönelik bu gibi çalışmaların tanziminde, onların seviyelerine, okul saatlerinin durumuna, istekli oluşlarına, öncesinde güzelce motive edilmelerine son derece dikkat edilmelidir. Günlük ve haftalık mecburi olan çalışma saatleri dışındaki çalışmalara teşvik ederken, talebenin ağır bir yük altında kalmasına veya öyle tevehhüm etmesine Azamî itina gösterilmelidir.
                            </ul>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Mütalaa Verme Bölümü</h4>
                            <ul class="list-disc pl-4 space-y-1">
                                1. Mütalaa verme, her dönem için iki küçük risaleyle sınırlıdır.<br>
                                2. Mütalaa verme bölümünü tamamlamak için, kurlarda belirtilen risaleler hafta sonu veya hafta içindeki müsait vakitlerde çalışılacaktır.<br>
                                3. Bu çalışmayla hedeflenen, talebenin kendi kendine risaleleri doğru anlayarak, konuya hâkim olarak başkalarına noksansız aktarabilmesi melekesini geliştirmektir.<br>
                                4. Mütalaa verme becerisinin gelişmesi için talebe yalnız olarak veya tecrübeli bir arkadaşının yardımıyla çalışabilir. Mütalaa verilirken (arz edilirken) her bir satırın ne anlama geldiğini bilmeyen birinin anlayabileceği bir açıklıkta izah edilmeye çalışılmalıdır.<br>
                                5. Mütalaa edilen sayfanın bütün lügatleri, ayet, hadis, Arabi ve Farisi ibare mealleri öğrenilmelidir. Neticede bir cemaat önünde ders yapacakmış gibi o risaledeki bütün cümleleri izah edebilecek bir seviyeye ulaşılmalıdır.<br>
                                6. Her bir sayfa çalışıldıktan sonra, -duruma göre- vakfa, kat vakfına veya yetişkin olan arkadaşlara arz edilmelidir. Bunda da hafta sonları veya boş vakitler tercih edilmelidir. Akşam programları bu çalışmayla meşgul edilmemelidir.
                            </ul>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Yazı Çalışması Bölümü</h4>
                            <ul class="list-disc pl-4 space-y-1">
                                1. Yazıya yeni başlayan talebelere, yazının fazilet ve ehemmiyetine dair dipnotta adresi verilen izahlar muhakkak sık aralıklarla anlatılarak şuur kazandırılmalıdır.<br>
                                2. Yazı çalışması akşam belirli bir saatte topluca yapılabileceği gibi gün içinde ferdî olarak da yapılabilir.<br>
                                3. Bütün kurlar için günlük yazı miktarı ortalama yarım sayfadır. Bununla birlikte şartları müsait olanların, günlük yazılarını bir sayfaya tamamlamaları ve külliyatı olabilecek en yakın zamanda yazarak bitirmeleri hedeflenmelidir.<br>
                                4. Yazıya yeni başlayan kardeşimize, ilk günlerde, kâğıdın takılışı, divitin tutuluşu, divite mürekkep alınışı ve harflerin yazılışı gibi durumlar incelikleriyle bizzat uygulamalı olarak gösterilip öğretilmelidir. Güzel bir örnek olmak için, özellikle ilk zamanlarda, yenilerle birlikte yazı yazmalı ve sorularına ve ihtiyaçlarına cevap verilmelidir.<br>
                                5. Yazılar yavaş ve dikkatli yazılmalı, acele ve savruk bir şekilde yazılmamalıdır. Zira yazı çalışması nasıl başlarsa ileriki yıllarda da o şekilde devam edeceğinden başlangıçtaki yazılar ihtimamla yazılmalıdır.<br>
                                6. Kardeşlerin güzel bir hatta sahip olmaları için ayrıca güzel yazı çalışması yapılmalıdır. İlk kurda talebe için hazırlanan hüsn-i hat çalışması titizlikle yapılmalıdır. Daha sonra ise Muhtasar Hüsn-i Hat kitabı eser yazmaya başlamadan yazılıp doldurulmalıdır.<br>
                                7. Her talebenin kendine ait diviti, kalem ucu, kâğıdı, eseri, cetveli olmalı ve bunları güzel bir dosya içinde özenle muhafaza etmelidir.<br>
                                8. Neticede, yazılan sayfalar muhakkak cilttirilerek bir eser haline getirilmeli, talebe bu noktada eser sahibi olmaya teşvik edilmelidir.<br>
                                9. Talebe, il dışı ziyaretlerde veya tatillerde yazı takımını yanında taşımaya teşvik edilmelidir. Tatile giden arkadaşların memleketlerinde de yazılarını aksatmamaları için gerekli teşvikler yapılmalıdır.<br>
                                10. Yazılar abdestli ve sarıklı olarak, mümkün olduğunca yazılan yer tefekkür edilerek yazılmalıdır.<br>
                                11. Yazı esnasında manevi bir atmosferin tesisi için malayani konuşmalardan ictinab ederek yazının manasına muvafık ahval içerisinde olmaya çalışılmalıdır.<br>
                                12. Medreseemizde yazı masaları kolay ulaşılabilen, çok kişinin beraber yazabileceği bir ortamda olmalıdır. Mümkünse "yazı köşesi" olarak cazibedar bir yer tahsis edilmelidir.<br>
                                13. "İbadetlerin en efdali az da olsa devamlı olanıdır." hadis-i şerifince, yazı hizmetinin, aksatılmadan devam ettirilen günlük bir alışkanlık hâline gelmesi temin edilmeye çalışılmalıdır.<br>
                                14. Muhterem Hocamızın yazılı duasına mazhar olmak için, kitabın sonundaki dua sayfasının yazılması unutulmamalıdır. Ayrıca imzalatmak üzere götürülecek eserlerin büyük eserlerden olmasına dikkat edilmelidir.
                            </ul>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Ezber Çalışması Bölümü</h4>
                            <ul class="list-disc pl-4 space-y-1">
                                1. Talebe kardeşlere yeri geldiğince ilimde ezberin yeri ve önemine dair hatırlatmalar yapılmalıdır.<br>
                                2. Kuran ve dua ezberi yaparken ezberden önce yapılacak ön hazırlık çalışmasıyla tecvid ve kıraat kaidelerine uygun okuma temin edilmelidir. Zira düzgün okuyamayan düzgün ezberleyemez.<br>
                                3. Risale-i Nur'u anlamada ezberin önemi dipnottaki2 adresten anlatılmalıdır.<br>
                                4. Günlerin uzunluk ve kısalıklarına, ulaşım ve ders durumlarına göre ezber zamanı sabah veya akşam vakitlerine kaydırılabilir. Ancak sabah namazından sonra zihnin daha berrak olduğu ve o vaktin feyiz ve bereketi cihetiyle mümkün mertebe sabah ezberi tercih edilmelidir.<br>
                                5. Gece yatmadan önce 10-15 dakika ezber edilecek satırlar mütalaa edilerek, lügatleri öğrenilerek, tekrar tekrar okuyarak hazırlık yapılması ilmen sabittir ki, sabahleyin ezberin kolaylıkla yapılmasını sağlayacaktır.<br>
                                6. Ezber yapılacak risale herkesin kendisine ait olmalıdır. Nerede hata yaptığı kurşun kalemle işaretlenerek sonraki tekrarlarda o işaretlerden yararlanılmalıdır.<br>
                                7. Ezberin sağlam ve pişkin olması esas olmalı, ezber verirken üçten fazla hata yapıldığında tekrar pişirip getirmesi istenmelidir.<br>
                                8. Özellikle haftalık ezber hedeflerinin tutturulmasına dikkat edilmelidir. Hafta içinde eksik kalan ezberler hafta sonunda tamamlanmalıdır. Zaruret olmadıkça haftanın her günü sabah ezber alışkanlığı yerleştirilmelidir.<br>
                                9. Ezber edilen yerin anlamadan ezberlenmesine müsaade edilmemeli. Ezber yapmaya başlamadan önce, ezberlenecek kısım lügatleriyle birlikte anlayarak mütalaa edilmelidir.<br>
                                10. Ezberlerin sağlam ve kalıcı olabilmesi için tekrarlara ve tamamının pişirilerek verilmesine dikkat edilmelidir.<br>
                                11. Arkadaşların özgüvenini arttırmak ve başkalarını da ezbere teşvik etmek adına ezberlenen risaleler topluluk önünde, umumî derslerde okutulmalıdır.<br>
                                12. Namaz tesbihatının ezberini kolaylaştırmak için, toplu tesbihatlar esnasında tesbihat yüzünden okunarak takip edilmelidir.
                            </ul>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Kitap Okuma Çalışması</h4>
                            <ul class="list-disc pl-4 space-y-1">
                                1. Kitap okuma çalışması da her dönem için iki küçük kitapla sınırlıdır. Yalnız Tarihçe-i Hayat büyük olduğu için onlar da birer kitap olarak okunacaktır.<br>
                                2. Bu kitaplar, medrese talebelerinin okuması gerçekten çok faydalı olacak ve Risâle-i Nur eğitim ve terbiyesine ciddi katkı sağlayacak olan kitaplardır.<br>
                                3. Kitaplar, günlük program saatlerinde değil, hafta içi veya hafta sonu bulunacak boş vakitlerde okunmalıdır.<br>
                                4. Sene içerisinde bitirmeye çalışmakla beraber bitirilemediği takdirde yaz tatilleri de bu kitapların okunması için fırsat olarak değerlendirilmelidir.
                            </ul>
                        </div>

                        <div class="bg-white/90 p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2">
                            <h4 class="font-black text-sky-950 text-sm">Şehadetname</h4>
                            <ul class="list-disc pl-4 space-y-1">
                               Şehadetname çalışmaları kur sisteminde 5. ve 7. kurlarda gösterilmiş olmakla beraber talebeye ilk zamanlardan itibaren şehadetnamenin önemi anlatılmalıdır. Bazı talebelerle daha evvelki kurlarda da şehadetname çalışmasına başlanabilir. Çalışma zamanı olarak hafta sonları, varsa hafta içi müsait vakitler, tatil zamanları değerlendirilebilir.
                            </ul>
                        </div>

                    </div>
                </div>
            ` : ''}

            <div class="bg-white p-4 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 shadow-sm overflow-x-auto flex items-center gap-2">
                ${STATIC_CURRICULUM.map(c => `
                    <button onclick="setCourseLevel(${c.level})" class="px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${window.selectedCourseLevel === c.level ? 'bg-emerald-500 text-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm' : 'bg-stone-50 text-slate-500 hover:text-slate-800 border-2 border-stone-200'}">
                        📖 ${c.level}. Kur
                    </button>
                `).join('')}
            </div>

            <div class="bg-white border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 class="text-xl font-black text-slate-800 mt-2">${currentCourse.title}</h3>

                <div class="space-y-6">
                    ${Object.keys(groupedTasks).map(category => {
                        const style = categoryStyles[category] || categoryStyles["Özel"];
                        const tasksInCat = groupedTasks[category];

                        return `
                            <div class="border-2 ${style.border} rounded-3xl p-5 ${style.bg} space-y-3 shadow-sm">
                                <div class="flex items-center gap-2 border-b border-stone-200/60 pb-2">
                                    <span class="text-lg">${style.icon}</span>
                                    <h4 class="font-black text-sm ${style.text}">${category}</h4>
                                </div>

                                <div class="space-y-2.5">
                                    ${tasksInCat.map(item => {
                                        const isInProgram = state.tasks.some(t => t.curriculumId === item.id);
                                        return `
                                            <div class="p-3.5 bg-white border-2 border-stone-200 rounded-2xl flex justify-between items-center gap-4 shadow-sm">
                                                <div class="space-y-0.5">
                                                    <h5 class="font-bold text-xs md:text-sm text-slate-800">${item.title}</h5>
                                                </div>
                                                
                                                <button onclick="toggleTaskSelection('${item.id}')" class="px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${isInProgram ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300' : 'bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-600 border-b-3 border-b-emerald-700 shadow-sm'}">
                                                    ${isInProgram ? '✓ Programımda' : '+ Ekle'}
                                                </button>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="mt-6 p-5 bg-stone-50 border-2 border-stone-200 border-b-4 border-b-stone-300 rounded-3xl space-y-3 shadow-sm">
                                <div class="flex items-center gap-2">
                                    <span class="text-xl">✨</span>
                                    <h4 class="text-xs font-black text-slate-700 uppercase tracking-wider">Özel Vazife Ekle</h4>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2">
                                    <input type="text" id="custom-task-input" placeholder="Vazife kaynağı..." class="flex-1 bg-white border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500">
                                    <select id="custom-task-category" class="bg-white border-2 border-stone-200 rounded-2xl px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-emerald-500">
                                        ${CATEGORY_OPTIONS.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                    </select>
                                    <button onclick="handleAddNewCustomTask()" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-xs border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm active:translate-y-0.5 transition-all">
                                        Ekle
                                    </button>
                                </div>
                            </div>
        </div>
    `;
}

window.setCourseLevel = function(level) {
    window.selectedCourseLevel = level;
    window.render();
};

function isOlderThanOneMonth(dateString) {
    if (!dateString) return false;
    const completedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - completedDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 7; // 7 gün veya daha fazla geçmişse true döner
}

function isCooldownCategory(category) {
    if (!category) return false;
    const catLower = category.toLowerCase();
    
    // Kur'an, Ezber, Mütalaa ve Şehadetname içeren kategoriler 7 gün kısıtına tabidir
    return catLower.includes('kur') || catLower.includes('ezber') || catLower.includes('mütalaa') || catLower.includes('şehadetname');
}

window.toggleTaskSelection = async function(currId) {
    let targetCourse = null;
    let foundItem = null;
    
    STATIC_CURRICULUM.forEach(c => {
        const match = c.tasks.find(t => t.id === currId);
        if (match) { targetCourse = c; foundItem = match; }
    });
    if (!foundItem) return;

    const targetLevel = targetCourse.level;

    // KISITLAMA 1: Bir önceki kur tamamen bitmeden üst kura geçilemez
    if (targetLevel > 1) {
        const previousLevel = targetLevel - 1;
        const prevCourse = STATIC_CURRICULUM.find(c => c.level === previousLevel);

        if (prevCourse) {
            const prevCourseTaskIds = prevCourse.tasks.map(t => t.id);
            const completedTaskIds = new Set();
            
            (state.tasks || []).forEach(t => {
                if (t.completed && t.curriculumId) completedTaskIds.add(t.curriculumId);
            });

            (state.completedHistory || []).forEach(t => {
                if (t.completed && t.curriculumId) completedTaskIds.add(t.curriculumId);
            });

            const uncompletedCount = prevCourseTaskIds.filter(id => !completedTaskIds.has(id)).length;

            if (uncompletedCount > 0) {
                showNotification(`Lütfen önce ${previousLevel}. Kur'un tüm vazifelerini tamamlayın! (${uncompletedCount} eksik var)`, "error");
                return;
            }
        }
    }

    // KISITLAMA 2: Kur'an, Ezber, Mütalaa ve Şehadetname alanlarında 1 hafta (7 gün) geçmeden tekrar alınamaz
    const needsCooldown = isCooldownCategory(foundItem.category);
    if (needsCooldown) {
        const historyItems = (state.completedHistory || []).filter(t => t.curriculumId === currId && t.completed);
        if (historyItems.length > 0) {
            const latestHistory = historyItems.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
            
            if (latestHistory && !isOlderThanOneMonth(latestHistory.completedAt)) {
                showNotification(`Bu vazifeyi tekrar alabilmek için üzerinden en az 7 gün geçmelidir! (Son Tamamlama: ${latestHistory.completedAt})`, "error");
                return;
            }
        }
    }

    const existingIndex = state.tasks.findIndex(t => t.curriculumId === currId);
    
    if (existingIndex !== -1) {
        state.tasks.splice(existingIndex, 1);
        showNotification("Vazife programınızdan çıkarıldı.", "info");
    } else {
        state.tasks.push({
            id: Date.now(),
            curriculumId: currId,
            title: foundItem.title,
            category: foundItem.category,
            level: targetLevel,
            completed: false,
            completedAt: null
        });
        showNotification("Vazife programınıza eklendi! 🎯", "success");
    }
    
    await saveUserData();
    window.render();
};
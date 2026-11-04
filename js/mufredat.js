import { state, saveUserData, showNotification } from './state.js';

window.selectedCourseLevel = window.selectedCourseLevel || 1;
window.showCurriculumInfoModal = window.showCurriculumInfoModal || false;
window.toggleCurriculumInfoModal = function() {
    window.showCurriculumInfoModal = !window.showCurriculumInfoModal;
    window.render();
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
    // Diğer kur seviyeleri (2. Kur'dan 10. Kur'a kadar) buraya eklenebilir...
];

export function renderCurriculumTab() {
    const currentCourse = STATIC_CURRICULUM.find(c => c.level === window.selectedCourseLevel) || STATIC_CURRICULUM[0];

    // Görevleri kategorilerine (alanlarına) göre gruplayalım
    const groupedTasks = {};
    currentCourse.tasks.forEach(item => {
        if (!groupedTasks[item.category]) {
            groupedTasks[item.category] = [];
        }
        groupedTasks[item.category].push(item);
    });

    // Kategori bazlı ikon ve renk tanımlamaları
    const categoryStyles = {
        "Kur'ân-ı Kerim": { icon: '📖', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        "Risale-i Nur Mütalaası": { icon: '📚', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', badge: 'bg-sky-100 text-sky-800 border-sky-300' },
        "Yazı Çalışması": { icon: '📜', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
        "Ezber Çalışması": { icon: '🎙️', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
        "Okunacak Kitaplar": { icon: '📖', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
        "Mütalaa Verme Çalışması": { icon: '📝', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', badge: 'bg-pink-100 text-pink-800 border-pink-300' },
        "Özel": { icon: '✨', bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-800', badge: 'bg-stone-200 text-stone-800 border-stone-300' }
    };

    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-4 border-b-stone-300 shadow-sm flex justify-between items-center gap-4">
                <div>
                    <h2 class="text-xl font-black text-slate-800">📖 Medrese Kur Listesi</h2>
                    <p class="text-xs text-slate-500 font-medium">Bulunduğunuz kuru seçerek alanlarına ayrılmış vazifelerinizi programınıza ekleyin.</p>
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

            <!-- KUR SEÇİM BUTONLARI -->
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
                                    <h4 class="font-black text-sm ${style.text}">${category} Alanı</h4>
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
        </div>
    `;
}

window.setCourseLevel = function(level) {
    window.selectedCourseLevel = level;
    window.render();
};

window.toggleTaskSelection = async function(currId) {
    let targetCourse = null;
    let foundItem = null;
    
    STATIC_CURRICULUM.forEach(c => {
        const match = c.tasks.find(t => t.id === currId);
        if (match) { targetCourse = c; foundItem = match; }
    });
    if (!foundItem) return;

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
            level: targetCourse ? targetCourse.level : 1,
            completed: false,
            completedAt: null
        });
        showNotification("Vazife programınıza eklendi! 🎯", "success");
    }
    
    await saveUserData();
    window.render();
};
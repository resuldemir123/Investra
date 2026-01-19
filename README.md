
# Investra: Stratejik Girişim Analizi ve Finansman Projeksiyon Sistemi

Investra, yazılım tabanlı teknoloji girişimlerinin (Tech-Startups) finansman arayış süreçlerini optimize etmek, yatırımcı beklentilerini nicel verilerle analiz etmek ve **Google Gemini 2.5 Pro** modelinin analitik kabiliyetleri aracılığıyla stratejik yol haritaları oluşturmak amacıyla geliştirilmiş profesyonel bir Karar Destek Sistemidir.

![Investra UI](https://img.shields.io/badge/UI-Sophisticated%20Navy-0b1120?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20|%20Gemini%20AI%20|%20Chart.js-blue?style=for-the-badge)

## 📊 Analitik Çerçeve ve Bileşenler

Sistem, girişimcilik literatüründeki temel finansman teorilerini (Pecking Order Theory, Agency Theory vb.) pratik bir arayüze entegre eder:

*   **Sermaye Tahsis Analizi:** Erken aşama girişimlerde kaynak dağılımının (Bootstrapping, Angel, VC) oransal analizi.
*   **Multivaryant Yatırım Karar Matrisi:** Yatırımcıların karar süreçlerinde kullandığı ağırlıklı kriterlerin (Ekip, Pazar, Teknoloji, Çekiş) radar diyagramı ile görselleştirilmesi.
*   **Kümülatif Finansman Döngüsü:** Tohum öncesinden (Pre-seed) halka arza (IPO) kadar olan sürecin metodolojik aşamaları.
*   **Yapay Zeka Destekli Risk Değerlendirmesi:** Gemini API kullanılarak gerçekleştirilen, nitel proje verilerinin nicel skorlara ve stratejik tavsiyelere dönüştürülmesi.

## 🛠️ Teknik Mimari

Platform, modern web standartları ve yüksek performanslı kütüphaneler üzerine inşa edilmiştir:

*   **Çekirdek:** React 18+ (Functional Components & Hooks).
*   **Yapay Zeka:** Google Gemini 2.5 Pro (Stratejik katman ve metin analizi).
*   **Görselleştirme:** Chart.js 4.0 (Radar vektörleri ve 16 karakterlik otomatik etiket sarma algoritması).
*   **Stil:** Tailwind CSS (Professional & Sophisticated Navy paleti).
*   **Güvenlik & Hata Yönetimi:** API limitleri için **Üstel Geri Çekilme (Exponential Backoff)** algoritması (1s, 2s, 4s, 8s, 16s).
*   **Veri Yönetimi:** LocalStorage tabanlı portföy yönetimi ve KVKK uyumlu şifreli veri işleme prensibi.

## 🚀 Öne Çıkan Özellikler

- **Vektör Matrisi:** Girişimin 4 ana dikeyde (Pazar, Ekip, Ürün, Finans) anlık skorlanması.
- **Stratejik Değerleme Tezi:** AI tarafından oluşturulan kapsamlı yatırımcı özeti.
- **Pazar İstihbaratı:** Güncel teknoloji trendleri (GenAI, SaaS, DeepTech) için canlı veri akışı simülasyonu.
- **Kurumsal Raporlama:** Analiz sonuçlarının PDF ve dijital formatta dışa aktarımı.

## 📦 Kurulum ve Çalıştırma

Uygulamanın çalışabilmesi için ortamda aşağıdaki kütüphanelerin mevcut olması gerekmektedir:

```bash
npm install lucide-react chart.js react-chartjs-2 @google/genai
```

### API Anahtarı
Uygulama, analiz işlemleri için `process.env.API_KEY` değişkenini kullanır. Gemini API üzerinden alınan anahtarın sisteme tanımlanmış olması gerekmektedir.

## 📈 Kullanım Talimatları

1.  **Analiz Başlat:** Kontrol Paneli üzerinden projenizin detaylı özetini girin (min. 100 karakter).
2.  **Stratejik Çıktı:** "Stratejik Analiz Başlat" butonuna tıklayarak AI modelinin verileri işlemesini bekleyin.
3.  **Portföy Yönetimi:** Beğendiğiniz analizleri "Portföye Kaydet" seçeneği ile arşivinize ekleyin.
4.  **Raporlama:** Analiz sonuçlarını "Raporu İndir" butonu ile kurumsal doküman haline getirin.

---
*Investra - Geleceğin Teknolojilerini Veriyle Şekillendirin.*

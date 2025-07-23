// screens/PrivacyPolicyScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gizlilik Politikası</Text>
      <Text style={styles.text}>
        Gizliliğiniz Bizim İçin Önemlidir{"\n\n"}
        İmame uygulaması olarak, kullanıcılarımızın kişisel verilerinin gizliliğine ve korunmasına büyük önem veriyoruz. Bu gizlilik politikası, hangi bilgileri topladığımızı, nasıl kullandığımızı ve koruduğumuzu açıklamaktadır.{"\n\n"}

        1. Toplanan Bilgiler{"\n"}
        Uygulamada sizden aşağıdaki bilgiler toplanabilir:{"\n"}
        - Ad, soyad{"\n"}
        - E-posta adresi{"\n"}
        - Telefon numarası{"\n"}
        - Adres bilgisi{"\n"}
        - Profil fotoğrafı (isteğe bağlı){"\n"}
        - Bildirim için cihaz tanımlayıcıları{"\n"}
        - Mezat işlemleriniz ve teklif geçmişiniz{"\n"}
        - Kullanım ve cihaz bilgileri (IP adresi, cihaz modeli vs.){"\n\n"}

        2. Bilgilerin Kullanım Amaçları{"\n"}
        Toplanan kişisel bilgiler şu amaçlarla kullanılabilir:{"\n"}
        - Hesap oluşturmak ve giriş işlemlerini gerçekleştirmek{"\n"}
        - Mezat işlemlerini yönetmek{"\n"}
        - Size bildirim göndermek{"\n"}
        - Destek ve müşteri hizmetleri sağlamak{"\n"}
        - Yasal yükümlülükleri yerine getirmek{"\n\n"}

        3. Bilgi Paylaşımı{"\n"}
        - Kişisel verileriniz, üçüncü kişilerle paylaşılmaz.{"\n"}
        - Yasal zorunluluklar dışında, bilgileriniz yalnızca İmame uygulaması içinde kullanılacaktır.{"\n"}
        - Mezat kazananları ve satıcıları, yalnızca ilgili taraflar görebilir.{"\n\n"}

        4. Bilgi Güvenliği{"\n"}
        - Tüm bilgiler, güvenli sunucularda ve yasalara uygun şekilde saklanır.{"\n"}
        - Yetkisiz erişime, veri kaybına veya izinsiz değişikliğe karşı teknik önlemler alınmıştır.{"\n\n"}

        5. Çerezler ve Takip{"\n"}
        - Uygulama, kullanım deneyimini iyileştirmek ve analiz etmek için çerez ve benzeri teknolojiler kullanabilir.{"\n"}
        - Reklam gösterimi için anonim kullanıcı davranışı analiz edilebilir.{"\n\n"}

        6. Bildirimler{"\n"}
        - Size push bildirim gönderebilmek için cihaz tanımlayıcınızı kaydediyoruz.{"\n"}
        - Dilediğiniz zaman uygulama ayarlarından bildirim tercihlerinizi değiştirebilirsiniz.{"\n\n"}

        7. Kişisel Bilgilerinize Erişim ve Güncelleme{"\n"}
        - Profil sayfanızdan kişisel bilgilerinizi görebilir ve güncelleyebilirsiniz.{"\n"}
        - Hesabınızı silmek isterseniz, bizimle iletişime geçebilirsiniz.{"\n\n"}

        8. Diğer Servisler ve Bağlantılar{"\n"}
        - Uygulamada Google veya Facebook ile giriş yapmanız halinde, bu servislerin kendi gizlilik politikaları geçerli olur.{"\n\n"}

        9. Değişiklikler{"\n"}
        - Gizlilik politikası zaman zaman güncellenebilir.{"\n"}
        - Güncellemeler uygulama içinde ve/veya web sitemizde duyurulur.{"\n\n"}

        10. İletişim{"\n"}
        Her türlü soru ve talepleriniz için: info@imameapp.com{"\n\n"}
        Bu gizlilik politikası 01.07.2024 tarihinde güncellenmiştir.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F2', padding: 24 },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#7B1421', // Bordo başlık
    letterSpacing: 0.5,
  },
  text: { 
    fontSize: 16, 
    lineHeight: 22, 
    color: '#2C2C2C',
  },
});


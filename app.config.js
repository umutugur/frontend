export default {
  expo: {
    owner: "umutugur",
    name: "Imame",
    slug: "imame",
    scheme: "com.umutugur.imame",
    icon: "./assets/logo.png",
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#FDF6E3"
    },
    main: "index.js",
    platforms: ["android", "ios"],
    runtimeVersion: { policy: "sdkVersion" },
    updates: { enabled: false },
    extra: {
      eas: { projectId: "2de51fda-069e-4bcc-b5c4-a3add9da16d7" }
    },

    // 🔹 App Store’un marketing version değeri (CFBundleShortVersionString)
    version: "1.1.0",

    android: {
      package: "com.umutugur.imame",
      googleServicesFile: "./google-services.json",
      permissions: ["NOTIFICATIONS"],
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "com.umutugur.imame" }],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      config: {
        googleMobileAdsAppId:
          "ca-app-pub-4306778139267554~1925991963"
      },
      // Android 16 (API 36) hedefleyen uygulamalarda edge-to-edge zorunlu;
      // opt-out yok. Açıkça açıyoruz ki davranış prebuild'de de aynı olsun.
      edgeToEdgeEnabled: true,
      // EAS autoIncrement bunu build sırasında +1 yapar ama DİNAMİK config'e
      // geri yazamaz (bump'ı app.json'a yazar, orası da yok sayılıyor).
      // Bu yüzden her yayından sonra buradaki değeri elle güncelliyoruz.
      // 32 = v1.1.0 build'i.
      versionCode: 32
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.umutugur.imame",
      buildNumber: "32", // EAS +1 yapar; dinamik config'e geri yazamadığı için elle takip ediyoruz
      usesAppleSignIn: true,
      infoPlist: {
        NSUserTrackingUsageDescription:
          "İmame uygulaması reklam ve analiz servisleri için takip izni ister. Bu izin verilmediği takdirde size özel reklamlar gösterilemeyebilir.",
        ITSAppUsesNonExemptEncryption: false
      },
      runtimeVersion: { policy: "sdkVersion" },
      minimumOsVersion: "15.1"
    },

    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            // Google Play, 31 Ağustos 2026'dan itibaren API 36 hedefi istiyor.
            // RN 0.79'un sürüm kataloğu AGP 8.8.2 getiriyor; bu birleşim yerel
            // Gradle derlemesiyle doğrulandı, compileSdk uyarısı çıkmadı.
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            minSdkVersion: 24
          },
          ios: {
            deploymentTarget: "15.1"
          }
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId:
            "ca-app-pub-4306778139267554~1925991963",
          iosAppId:
            "ca-app-pub-4306778139267554~3035532261"
        }
      ],
      "expo-apple-authentication",
      "expo-notifications",
      "expo-font"
    ]
  }
};
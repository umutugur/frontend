export default {
  expo: {
    owner: "umutugur",
    name: "Imame",
    slug: "imame",
    scheme: "com.umutugur.imame",
    icon: "./assets/logo.png",
    splash: { image: "./assets/logo.png", resizeMode: "contain", backgroundColor: "#FDF6E3" },
    main: "index.js",
    platforms: ["android", "ios"],
    runtimeVersion: { policy: "sdkVersion" },
    updates: { enabled: false },
    extra: { eas: { projectId: "2de51fda-069e-4bcc-b5c4-a3add9da16d7" } },

    // 🔴 BUNU EKLE/ARTTIR (CFBundleShortVersionString)
    version: "1.0.4",

    android: {
      package: "com.umutugur.imame",
      googleServicesFile: "./google-services.json",
      permissions: ["NOTIFICATIONS"],
      intentFilters: [{ action: "VIEW", data: [{ scheme: "com.umutugur.imame" }], category: ["BROWSABLE","DEFAULT"] }],
      config: { googleMobileAdsAppId: "ca-app-pub-4306778139267554~1925991963" },
      // (Android build alacaksan) arttır
      versionCode: 4
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.umutugur.imame",
      // 🔴 BUNU DA ARTIR (CFBundleVersion)
      buildNumber: "4",
      usesAppleSignIn: true,
      infoPlist: {
        NSUserTrackingUsageDescription:
          "İmame uygulaması reklam ve analiz servisleri için takip izni ister. Bu izin verilmediği takdirde, size özel reklamlar gösterilemeyebilir.",
        ITSAppUsesNonExemptEncryption: false
      },
      runtimeVersion: { policy: "sdkVersion" },
      minimumOsVersion: "15.1"
    },

    plugins: [
      ["expo-build-properties", { android: { compileSdkVersion: 35, targetSdkVersion: 35, minSdkVersion: 24 }, ios: { deploymentTarget: "15.1" } }],
      ["react-native-google-mobile-ads", { androidAppId: "ca-app-pub-4306778139267554~1925991963", iosAppId: "ca-app-pub-4306778139267554~3035532261" }],
      "expo-apple-authentication",
      "expo-notifications"
    ]
  }
};
export default {
  expo: {
    name: "Pão da Vida",
    slug: "paodavida",

    scheme: "paodavida",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",

    updates: {
      url: "https://u.expo.dev/626675d9-6560-459a-b2a1-d33518cefd47",
      enabled: true,
      fallbackToCacheTimeout: 0
    },

    runtimeVersion: {
      policy: "appVersion"
    },

    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },

    android: {
      package: "com.paodavida.app",
      versionCode: 4,
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff"
      },
      permissions: ["NOTIFICATIONS"]
    },

    assetBundlePatterns: ["**/*"],

    plugins: [
      "expo-router",
      "expo-notifications"
    ],

    extra: {
      eas: {
        projectId: "626675d9-6560-459a-b2a1-d33518cefd47"
      }
    }
  }
}

import type { CapacitorConfig } from "@capacitor/core"

const config: CapacitorConfig = {
  appId: "com.wonlink.app",
  appName: "Wonlink",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#667eea",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#667eea",
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#667eea",
    },
  },
  android: {
    buildOptions: {
      keystorePath: "android/app/release.keystore",
      keystoreAlias: "wonlink",
      releaseType: "AAB",
      signingType: "apksigner",
    },
  },
}

export default config

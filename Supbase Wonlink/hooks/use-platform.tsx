"use client"

import { useState, useEffect } from "react"
import { Capacitor } from "@capacitor/core"
import { Device } from "@capacitor/device"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { Keyboard } from "@capacitor/keyboard"

interface PlatformInfo {
  isNative: boolean
  isAndroid: boolean
  isIOS: boolean
  isWeb: boolean
  deviceInfo: any
  safeAreaTop: number
  safeAreaBottom: number
}

export function usePlatform() {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isNative: false,
    isAndroid: false,
    isIOS: false,
    isWeb: true,
    deviceInfo: null,
    safeAreaTop: 0,
    safeAreaBottom: 0,
  })

  useEffect(() => {
    const initializePlatform = async () => {
      const isNative = Capacitor.isNativePlatform()
      const platform = Capacitor.getPlatform()

      let deviceInfo = null
      if (isNative) {
        deviceInfo = await Device.getInfo()

        // Configure status bar for mobile
        if (platform === "android") {
          await StatusBar.setStyle({ style: Style.Light })
          await StatusBar.setBackgroundColor({ color: "#667eea" })
        }

        // Hide splash screen
        await SplashScreen.hide()

        // Configure keyboard
        Keyboard.addListener("keyboardWillShow", (info) => {
          document.documentElement.style.setProperty("--keyboard-height", `${info.keyboardHeight}px`)
        })

        Keyboard.addListener("keyboardWillHide", () => {
          document.documentElement.style.setProperty("--keyboard-height", "0px")
        })
      }

      setPlatformInfo({
        isNative,
        isAndroid: platform === "android",
        isIOS: platform === "ios",
        isWeb: platform === "web",
        deviceInfo,
        safeAreaTop: isNative ? deviceInfo?.safeAreaTop || 0 : 0,
        safeAreaBottom: isNative ? deviceInfo?.safeAreaBottom || 0 : 0,
      })
    }

    initializePlatform()
  }, [])

  return platformInfo
}

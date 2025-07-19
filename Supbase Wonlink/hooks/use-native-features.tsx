"use client"

import { useState, useEffect } from "react"
import { Capacitor } from "@capacitor/core"
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"
import { Share } from "@capacitor/share"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Preferences } from "@capacitor/preferences"
import { Network } from "@capacitor/network"

export function useNativeFeatures() {
  const [isOnline, setIsOnline] = useState(true)
  const [networkType, setNetworkType] = useState<string>("unknown")

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Monitor network status
      Network.addListener("networkStatusChange", (status) => {
        setIsOnline(status.connected)
        setNetworkType(status.connectionType)
      })

      // Get initial network status
      Network.getStatus().then((status) => {
        setIsOnline(status.connected)
        setNetworkType(status.connectionType)
      })
    }
  }, [])

  const takePicture = async () => {
    if (!Capacitor.isNativePlatform()) {
      throw new Error("Camera not available on web platform")
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      })
      return image.webPath
    } catch (error) {
      console.error("Error taking picture:", error)
      throw error
    }
  }

  const selectFromGallery = async () => {
    if (!Capacitor.isNativePlatform()) {
      throw new Error("Gallery not available on web platform")
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      })
      return image.webPath
    } catch (error) {
      console.error("Error selecting from gallery:", error)
      throw error
    }
  }

  const shareContent = async (title: string, text: string, url?: string) => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to Web Share API
      if (navigator.share) {
        return navigator.share({ title, text, url })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${title}\n${text}${url ? `\n${url}` : ""}`)
        return Promise.resolve()
      }
    }

    try {
      await Share.share({
        title,
        text,
        url,
      })
    } catch (error) {
      console.error("Error sharing:", error)
      throw error
    }
  }

  const hapticFeedback = async (style: "light" | "medium" | "heavy" = "medium") => {
    if (!Capacitor.isNativePlatform()) return

    try {
      const impactStyle =
        style === "light" ? ImpactStyle.Light : style === "heavy" ? ImpactStyle.Heavy : ImpactStyle.Medium
      await Haptics.impact({ style: impactStyle })
    } catch (error) {
      console.error("Error with haptic feedback:", error)
    }
  }

  const scheduleNotification = async (title: string, body: string, delay = 0) => {
    if (!Capacitor.isNativePlatform()) return

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: delay > 0 ? { at: new Date(Date.now() + delay) } : undefined,
          },
        ],
      })
    } catch (error) {
      console.error("Error scheduling notification:", error)
    }
  }

  const storeData = async (key: string, value: string) => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value })
    } else {
      localStorage.setItem(key, value)
    }
  }

  const getData = async (key: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key })
      return value
    } else {
      return localStorage.getItem(key)
    }
  }

  return {
    isOnline,
    networkType,
    takePicture,
    selectFromGallery,
    shareContent,
    hapticFeedback,
    scheduleNotification,
    storeData,
    getData,
    isNative: Capacitor.isNativePlatform(),
  }
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { Bell, BellRing, User, Briefcase, MessageCircle, DollarSign, Settings, Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  type: "application" | "message" | "payment" | "campaign" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: "low" | "medium" | "high"
}

interface NotificationSystemProps {
  className?: string
  data?: Notification[]
}

export function NotificationSystem({ className, data = [] }: NotificationSystemProps) {
  const { language, user } = useApp()
  const t = useTranslation(language)
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>(data)
  const [unreadCount, setUnreadCount] = useState(data.filter((n) => !n.read).length)
  const [isOpen, setIsOpen] = useState(false)

  // Mock notifications - replace with actual API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "application",
        title: "New Application",
        message: "Sarah Kim applied to your Summer Beauty Campaign",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        actionUrl: "/brand/campaigns/1/applications",
        priority: "high",
      },
      {
        id: "2",
        type: "message",
        title: "New Message",
        message: "You have a new message from Alex Park",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        actionUrl: "/messages/alex-park",
        priority: "medium",
      },
      {
        id: "3",
        type: "payment",
        title: "Payment Received",
        message: "₩150,000 payment for Fashion Campaign completed",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true,
        actionUrl: "/wallet",
        priority: "medium",
      },
      {
        id: "4",
        type: "campaign",
        title: "Campaign Approved",
        message: "Your Beauty Product Review campaign has been approved",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        actionUrl: "/campaigns/beauty-review",
        priority: "low",
      },
    ]

    if (data.length === 0) {
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.read).length)
    }
  }, [data])

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "application":
        return User
      case "message":
        return MessageCircle
      case "payment":
        return DollarSign
      case "campaign":
        return Briefcase
      case "system":
        return Settings
      default:
        return Bell
    }
  }

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-orange-600 dark:text-orange-400"
      case "low":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    const notification = notifications.find((n) => n.id === id)
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    setIsOpen(false)
  }

  // Real-time notification simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification
      if (Math.random() > 0.95) {
        // 5% chance every 5 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "message",
          title: "New Message",
          message: "You have a new message",
          timestamp: new Date(),
          read: false,
          priority: "medium",
        }

        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show toast notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [toast])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className={cn("relative", className)}>
          {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 h-4 min-w-[16px] translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 p-0.5 text-[10px] leading-none text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {notifications.length === 0 && <DropdownMenuItem disabled>You’re all caught up!</DropdownMenuItem>}
        {notifications.map((n) => {
          const Icon = getNotificationIcon(n.type)

          return (
            <DropdownMenuItem key={n.id} onSelect={() => markAsRead(n.id)} className={n.read ? "opacity-60" : ""}>
              {!n.read && <Circle className="mr-2 h-2 w-2 fill-red-600 text-red-600" />}
              {n.message}
              {n.read && <Check className="ml-auto h-4 w-4 text-green-600" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

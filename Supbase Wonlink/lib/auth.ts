import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser extends User {
  profile?: {
    name: string
    role: "brand" | "influencer"
    avatar_url?: string
    verified: boolean
  }
}

export const auth = {
  async signUp(email: string, password: string, userData: { name: string; role: "brand" | "influencer" }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email!,
        name: userData.name,
        role: userData.role,
      })

      if (profileError) throw profileError
    }

    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signInWithOAuth(provider: "google" | "kakao") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role, avatar_url, verified")
      .eq("id", user.id)
      .single()

    return {
      ...user,
      profile: profile || undefined,
    }
  },

  async updateProfile(updates: {
    name?: string
    bio?: string
    website?: string
    avatar_url?: string
    social_links?: Record<string, any>
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

    if (error) throw error
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },
}

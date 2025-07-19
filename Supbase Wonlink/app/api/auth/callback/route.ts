import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(new URL("/auth?error=callback_error", request.url))
    }

    if (data.user) {
      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

      // If no profile exists, create one
      if (!profile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
          role: "influencer", // Default role, can be changed later
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }
      }

      // Redirect to dashboard based on role
      const redirectUrl = profile?.role === "brand" ? "/brand/dashboard" : "/influencer/dashboard"
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL("/auth", request.url))
}

import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const data = await auth.signIn(email, password)

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: "Signed in successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to sign in" }, { status: 401 })
  }
}

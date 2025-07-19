import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const data = await auth.signUp(email, password, { name, role })

    return NextResponse.json({
      success: true,
      user: data.user,
      message: "Account created successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 400 })
  }
}

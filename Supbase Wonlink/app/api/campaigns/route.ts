import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const query = supabase
      .from("campaigns")
      .select(`
        *,
        profiles:brand_id (
          name,
          avatar_url,
          verified
        )
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ campaigns: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, budget, requirements, deliverables, start_date, end_date, tags, target_audience } = body

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is a brand
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "brand") {
      return NextResponse.json({ error: "Only brands can create campaigns" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        brand_id: user.id,
        title,
        description,
        budget,
        requirements,
        deliverables: deliverables || [],
        start_date,
        end_date,
        tags: tags || [],
        target_audience: target_audience || {},
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

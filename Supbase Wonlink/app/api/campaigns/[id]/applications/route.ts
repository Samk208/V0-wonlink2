import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/campaigns/[id]/applications - Get all applications for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is the brand owner of this campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("brand_id")
      .eq("id", campaignId)
      .single()

    if (campaignError) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.brand_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all applications for this campaign with influencer details
    const { data: applications, error } = await supabase
      .from("campaign_applications")
      .select(`
        *,
        profiles:influencer_id (
          name,
          avatar_url,
          bio,
          follower_count,
          engagement_rate,
          verified
        )
      `)
      .eq("campaign_id", campaignId)
      .order("applied_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/campaigns/[id]/applications - Submit application to a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const body = await request.json()
    const { proposal, proposed_rate } = body

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is an influencer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "influencer") {
      return NextResponse.json({ error: "Only influencers can apply to campaigns" }, { status: 403 })
    }

    // Check if campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("status, brand_id")
      .eq("id", campaignId)
      .single()

    if (campaignError) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign is not active" }, { status: 400 })
    }

    // Check if user already applied
    const { data: existingApplication } = await supabase
      .from("campaign_applications")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("influencer_id", user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this campaign" }, { status: 400 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from("campaign_applications")
      .insert({
        campaign_id: campaignId,
        influencer_id: user.id,
        proposal,
        proposed_rate: proposed_rate ? Number(proposed_rate) : null,
        status: "pending"
      })
      .select(`
        *,
        profiles:influencer_id (
          name,
          avatar_url,
          bio,
          follower_count,
          engagement_rate,
          verified
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // TODO: Create notification for brand owner
    // await createNotification(campaign.brand_id, "New application received", ...)

    return NextResponse.json({ 
      application,
      message: "Application submitted successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/campaigns/[id]/applications - Update application status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const body = await request.json()
    const { application_id, status, feedback } = body

    if (!application_id || !status) {
      return NextResponse.json({ error: "Application ID and status are required" }, { status: 400 })
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is the brand owner of this campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("brand_id")
      .eq("id", campaignId)
      .single()

    if (campaignError) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.brand_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update application status
    const { data: application, error } = await supabase
      .from("campaign_applications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        feedback: feedback || null
      })
      .eq("id", application_id)
      .eq("campaign_id", campaignId)
      .select(`
        *,
        profiles:influencer_id (
          name,
          avatar_url,
          bio,
          follower_count,
          engagement_rate,
          verified
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // TODO: Create notification for influencer
    // await createNotification(application.influencer_id, `Application ${status}`, ...)

    return NextResponse.json({ 
      application,
      message: `Application ${status} successfully` 
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

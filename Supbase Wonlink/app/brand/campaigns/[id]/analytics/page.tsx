"use client"

import CampaignAnalyticsPage from "@/components/campaign-management/campaign-analytics-page"

interface CampaignAnalyticsPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignAnalytics({ params }: CampaignAnalyticsPageProps) {
  const { id } = await params
  return <CampaignAnalyticsPage campaignId={id} />
}

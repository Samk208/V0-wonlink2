"use client"

import CampaignDetailPage from "@/components/campaign-management/campaign-detail-page"

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetail({ params }: CampaignDetailPageProps) {
  const { id } = await params
  return <CampaignDetailPage campaignId={id} />
}

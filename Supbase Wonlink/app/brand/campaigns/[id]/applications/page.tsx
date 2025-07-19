"use client"

import ApplicationReviewInterface from "@/components/campaign-management/application-review-interface"

interface ApplicationReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationReviewPage({ params }: ApplicationReviewPageProps) {
  const { id } = await params
  return <ApplicationReviewInterface campaignId={id} />
}

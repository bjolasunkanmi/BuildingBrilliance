import { Metadata } from 'next'
import { CreatorStudio } from '@/components/creator/CreatorStudio'

export const metadata: Metadata = {
  title: 'Creator Studio - BuildingBrilliance AI',
  description: 'Create and manage your financial education content with professional tools and AI-powered insights.',
}

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CreatorStudio />
    </div>
  )
}
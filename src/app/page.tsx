import { HeroSection } from '@/components/home/HeroSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { StatsSection } from '@/components/home/StatsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CTASection } from '@/components/home/CTASection'
import { TrustSection } from '@/components/home/TrustSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Trust Indicators */}
      <TrustSection />
      
      {/* Platform Statistics */}
      <StatsSection />
      
      {/* Features Overview */}
      <FeaturesSection />
      
      {/* Social Proof */}
      <TestimonialsSection />
      
      {/* Call to Action */}
      <CTASection />
    </div>
  )
}
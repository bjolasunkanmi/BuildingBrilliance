'use client'

import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  SparklesIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const features = [
  {
    icon: ChartBarIcon,
    title: 'AI-Powered Analytics',
    description: 'Advanced insights and recommendations'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'ValueNFT System',
    description: 'Content tokenization with dynamic value'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Compliance First',
    description: 'SEC-compliant financial education'
  }
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-32 h-32 bg-secondary-200 rounded-full opacity-20"
        animate={{ 
          y: [0, 20, 0],
          rotate: [360, 180, 0]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Badge
              variant="primary"
              size="lg"
              className="inline-flex items-center space-x-2"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Now in Beta - Join the Financial Creator Revolution</span>
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="heading-1 mb-6 text-balance"
          >
            Empower Your Audience,{' '}
            <span className="text-gradient">
              Earn Real Value
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance"
          >
            The first AI-driven financial creator economy platform where your impact 
            is tokenized, your expertise is rewarded, and your audience builds real wealth 
            through your guidance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              href="/register"
              className="min-w-[200px]"
            >
              Start Creating
            </Button>
            <Button
              variant="outline"
              size="lg"
              leftIcon={<PlayIcon className="h-5 w-5" />}
              className="min-w-[200px]"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="glass p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-gray-500 mb-4">
              Trusted by financial educators worldwide
            </p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">10K+</div>
              <div className="text-sm text-gray-400">Active Creators</div>
              <div className="text-2xl font-bold text-gray-400">$2M+</div>
              <div className="text-sm text-gray-400">Creator Earnings</div>
              <div className="text-2xl font-bold text-gray-400">50K+</div>
              <div className="text-sm text-gray-400">ValueNFTs Minted</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gray-300 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
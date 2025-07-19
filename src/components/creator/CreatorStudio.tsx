'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VideoCameraIcon,
  PhotoIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlayCircleIcon,
  CloudArrowUpIcon,
  EyeIcon,
  HeartIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  PlusIcon,
  FolderIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { VideoUploader } from '@/components/content/VideoUploader'
import { LiveStreaming } from '@/components/content/LiveStreaming'
import { ContentManager } from '@/components/content/ContentManager'
import { CreatorAnalytics } from '@/components/analytics/CreatorAnalytics'
import { useAuth } from '@/hooks/useAuth'
import { formatNumber, formatCurrency } from '@/utils/format'

interface CreatorStats {
  totalViews: number
  totalSubscribers: number
  totalRevenue: number
  monthlyViews: number
  monthlyRevenue: number
  contentCount: number
  liveStreams: number
  engagementRate: number
}

const quickActions = [
  {
    id: 'upload',
    title: 'Upload Video',
    description: 'Share your financial expertise with video content',
    icon: VideoCameraIcon,
    color: 'bg-primary-500',
    action: 'upload'
  },
  {
    id: 'stream',
    title: 'Go Live',
    description: 'Stream live financial education sessions',
    icon: PlayCircleIcon,
    color: 'bg-red-500',
    action: 'stream'
  },
  {
    id: 'article',
    title: 'Write Article',
    description: 'Create in-depth financial guides and tutorials',
    icon: DocumentTextIcon,
    color: 'bg-green-500',
    action: 'article'
  },
  {
    id: 'podcast',
    title: 'Record Podcast',
    description: 'Share audio content and interviews',
    icon: MicrophoneIcon,
    color: 'bg-purple-500',
    action: 'podcast'
  }
]

export function CreatorStudio() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [creatorStats, setCreatorStats] = useState<CreatorStats>({
    totalViews: 0,
    totalSubscribers: 0,
    totalRevenue: 0,
    monthlyViews: 0,
    monthlyRevenue: 0,
    contentCount: 0,
    liveStreams: 0,
    engagementRate: 0
  })
  const [recentContent, setRecentContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch creator stats and content
  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - replace with actual API calls
        setCreatorStats({
          totalViews: 125000,
          totalSubscribers: 3400,
          totalRevenue: 2850.50,
          monthlyViews: 28500,
          monthlyRevenue: 485.25,
          contentCount: 47,
          liveStreams: 8,
          engagementRate: 7.2
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch creator data:', error)
        setIsLoading(false)
      }
    }

    fetchCreatorData()
  }, [])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'upload':
        setActiveTab('upload')
        break
      case 'stream':
        setActiveTab('stream')
        break
      case 'article':
        // Handle article creation
        break
      case 'podcast':
        // Handle podcast creation
        break
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Creator Studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Creator Studio
        </h1>
        <p className="text-gray-600">
          Create, manage, and analyze your financial education content
        </p>
      </div>

      {/* Main Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <CloudArrowUpIcon className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="stream" className="flex items-center space-x-2">
            <PlayCircleIcon className="h-4 w-4" />
            <span>Live</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <FolderIcon className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Welcome Section */}
          <Card className="p-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {user?.firstName || user?.username}!
                </h2>
                <p className="opacity-90">
                  Ready to create amazing financial education content?
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-75">Your Impact Score</div>
                <div className="text-3xl font-bold">
                  {user?.impactScore?.toFixed(1) || '0.0'}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card
                  key={action.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{action.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Channel Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <EyeIcon className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(creatorStats.totalViews)}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
                <div className="text-xs text-green-600 mt-1">
                  +{formatNumber(creatorStats.monthlyViews)} this month
                </div>
              </Card>

              <Card className="p-6 text-center">
                <HeartIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(creatorStats.totalSubscribers)}
                </div>
                <div className="text-sm text-gray-600">Subscribers</div>
                <div className="text-xs text-green-600 mt-1">
                  +{creatorStats.engagementRate}% engagement
                </div>
              </Card>

              <Card className="p-6 text-center">
                <CurrencyDollarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(creatorStats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-xs text-green-600 mt-1">
                  +{formatCurrency(creatorStats.monthlyRevenue)} this month
                </div>
              </Card>

              <Card className="p-6 text-center">
                <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {creatorStats.contentCount}
                </div>
                <div className="text-sm text-gray-600">Total Content</div>
                <div className="text-xs text-blue-600 mt-1">
                  {creatorStats.liveStreams} live streams
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Content */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Content</h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center">
                      <VideoCameraIcon className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        Understanding Cryptocurrency Basics
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>2.3K views</span>
                        <span>85% retention</span>
                        <Badge variant="success">Published</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">Top Performing Video</div>
                    <div className="text-sm text-green-600">
                      "Investment Portfolio Basics" - 15.2K views
                    </div>
                  </div>
                  <div className="text-2xl">🏆</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-800">Trending Topic</div>
                    <div className="text-sm text-blue-600">
                      Cryptocurrency content is getting 40% more views
                    </div>
                  </div>
                  <div className="text-2xl">📈</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium text-purple-800">AI Suggestion</div>
                    <div className="text-sm text-purple-600">
                      Consider creating content about "Emergency Funds"
                    </div>
                  </div>
                  <div className="text-2xl">🤖</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Upcoming Schedule */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Upcoming Schedule
              </h3>
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Schedule Content
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No scheduled content</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Schedule Now
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Upload Content</h2>
            <VideoUploader
              onUploadComplete={(data) => {
                console.log('Upload completed:', data)
                // Handle successful upload
              }}
              onUploadError={(error) => {
                console.error('Upload error:', error)
                // Handle upload error
              }}
            />
          </Card>
        </TabsContent>

        {/* Live Streaming Tab */}
        <TabsContent value="stream">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Live Streaming</h2>
            <LiveStreaming
              onStreamStart={(data) => {
                console.log('Stream started:', data)
                // Handle stream start
              }}
              onStreamEnd={() => {
                console.log('Stream ended')
                // Handle stream end
              }}
            />
          </Card>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content">
          <ContentManager />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <CreatorAnalytics />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Channel Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Channel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Channel Name
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      defaultValue={user?.username}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Channel Category
                    </label>
                    <select className="input w-full">
                      <option>Financial Education</option>
                      <option>Investment Advice</option>
                      <option>Personal Finance</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Monetization</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Enable ad revenue sharing</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Enable viewer donations</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Enable premium subscriptions</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
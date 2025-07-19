// User Types
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  walletAddress?: string
  isVerified: boolean
  kycStatus: KYCStatus
  tier: UserTier
  
  // Profile
  website?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  location?: string
  timezone?: string
  language: string
  
  // Platform Stats
  totalEarnings: number
  impactScore: number
  followerCount: number
  followingCount: number
  contentCount: number
  
  createdAt: string
  updatedAt: string
}

export type UserTier = 'ROOKIE' | 'VERIFIED_MENTOR' | 'ELITE_ECONOMIST'
export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

// Content Types
export interface Content {
  id: string
  title: string
  description?: string
  slug: string
  content: string
  contentType: ContentType
  category: ContentCategory
  tags: string[]
  
  // Media
  thumbnailUrl?: string
  videoUrl?: string
  audioUrl?: string
  attachments: string[]
  
  // Publishing
  status: ContentStatus
  publishedAt?: string
  scheduledAt?: string
  
  // Monetization
  isPremium: boolean
  price?: number
  currency: string
  
  // Analytics
  viewCount: number
  likeCount: number
  shareCount: number
  saveCount: number
  engagementScore: number
  
  // AI Analysis
  readingTime?: number
  difficultyLevel?: number
  qualityScore?: number
  complianceScore?: number
  
  // Relations
  authorId: string
  author: User
  valueNFT?: ValueNFT
  
  createdAt: string
  updatedAt: string
}

export type ContentType = 'ARTICLE' | 'VIDEO' | 'PODCAST' | 'INFOGRAPHIC' | 'COURSE' | 'WEBINAR' | 'TOOL'
export type ContentCategory = 
  | 'PERSONAL_FINANCE' 
  | 'INVESTING' 
  | 'BUDGETING' 
  | 'CRYPTOCURRENCY' 
  | 'FINANCIAL_LITERACY' 
  | 'ECONOMICS' 
  | 'TRADING' 
  | 'RETIREMENT_PLANNING' 
  | 'INSURANCE' 
  | 'TAXES'
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED' | 'UNDER_REVIEW'

// ValueNFT Types
export interface ValueNFT {
  id: string
  tokenId: string
  contractAddress: string
  metadataUri: string
  
  // Content Reference
  contentId: string
  content: Content
  
  // NFT Details
  name: string
  description: string
  image: string
  attributes: Record<string, any>
  
  // Value Metrics
  initialValue: number
  currentValue: number
  impactScore: number
  engagementScore: number
  
  // Ownership
  ownerId: string
  owner: User
  
  // Trading
  isListed: boolean
  listPrice?: number
  lastSalePrice?: number
  
  createdAt: string
  updatedAt: string
}

// Transaction Types
export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  
  // Amounts
  amount: number
  fee: number
  netAmount: number
  currency: string
  
  // Blockchain
  txHash?: string
  blockNumber?: number
  gasUsed?: string
  
  // References
  userId: string
  user: User
  contentId?: string
  
  // Payment Details
  paymentMethod?: PaymentMethod
  stripePaymentId?: string
  
  // Metadata
  description?: string
  metadata?: Record<string, any>
  
  createdAt: string
  updatedAt: string
}

export type TransactionType = 
  | 'CONTENT_PURCHASE' 
  | 'SUBSCRIPTION' 
  | 'TIP' 
  | 'NFT_MINT' 
  | 'NFT_SALE' 
  | 'TOKEN_REWARD' 
  | 'WITHDRAWAL' 
  | 'DEPOSIT'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'STRIPE' | 'CRYPTO' | 'BANK_TRANSFER'

// Analytics Types
export interface ContentAnalytics {
  id: string
  contentId: string
  content: Content
  
  // Time-based metrics
  date: string
  views: number
  uniqueViews: number
  watchTime: number
  bounceRate: number
  
  // Engagement metrics
  likes: number
  comments: number
  shares: number
  saves: number
  
  // Financial metrics
  revenue: number
  tips: number
  subscriptions: number
  
  // AI Insights
  sentimentScore?: number
  topicRelevance?: number
  qualityScore?: number
  
  createdAt: string
}

// Subscription Types
export interface Subscription {
  id: string
  type: SubscriptionType
  status: SubscriptionStatus
  
  // Billing
  price: number
  currency: string
  billingCycle: BillingCycle
  nextBillingDate: string
  
  // References
  userId: string
  user: User
  creatorId?: string
  
  // Stripe Integration
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  
  createdAt: string
  updatedAt: string
}

export type SubscriptionType = 'CREATOR_PREMIUM' | 'PLATFORM_PRO' | 'ENTERPRISE'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAUSED'
export type BillingCycle = 'MONTHLY' | 'YEARLY'

// Notification Types
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  
  // References
  userId: string
  user: User
  
  // Metadata
  metadata?: Record<string, any>
  actionUrl?: string
  
  createdAt: string
}

export type NotificationType = 
  | 'CONTENT_PUBLISHED' 
  | 'NEW_FOLLOWER' 
  | 'COMMENT_RECEIVED' 
  | 'PAYMENT_RECEIVED' 
  | 'ACHIEVEMENT_UNLOCKED' 
  | 'SYSTEM_UPDATE'

// Achievement Types
export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon?: string
  
  // Progress
  currentValue: number
  targetValue: number
  isCompleted: boolean
  completedAt?: string
  
  // Rewards
  rewardPoints: number
  rewardTokens: number
  
  // References
  userId: string
  user: User
  
  createdAt: string
  updatedAt: string
}

// Web3 Types
export interface Web3Context {
  account: string | null
  chainId: number | null
  isConnecting: boolean
  isConnected: boolean
  connect: (connector: any) => Promise<void>
  disconnect: () => void
  switchChain: (chainId: number) => Promise<void>
}

export interface ContractConfig {
  address: string
  abi: any[]
  chainId: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Dashboard Types
export interface DashboardStats {
  totalEarnings: number
  monthlyEarnings: number
  totalViews: number
  monthlyViews: number
  contentCount: number
  followerCount: number
  impactScore: number
  nftValue: number
}

export interface AnalyticsPeriod {
  label: string
  value: string
  days: number
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  username: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface ContentForm {
  title: string
  description?: string
  content: string
  contentType: ContentType
  category: ContentCategory
  tags: string[]
  isPremium: boolean
  price?: number
  thumbnailUrl?: string
  scheduledAt?: string
}

// UI Component Types
export interface DropdownItem {
  label: string
  value?: string
  href?: string
  icon?: React.ComponentType<any>
  onClick?: () => void
  type?: 'item' | 'divider'
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  fontSize: 'sm' | 'md' | 'lg'
}
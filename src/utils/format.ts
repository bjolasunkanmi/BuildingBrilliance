/**
 * Format file size in bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS format
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return [hours, minutes, secs]
      .map(val => val.toString().padStart(2, '0'))
      .join(':')
  }
  
  return [minutes, secs]
    .map(val => val.toString().padStart(2, '0'))
    .join(':')
}

/**
 * Format number with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  
  const suffixes = ['', 'K', 'M', 'B', 'T']
  const tier = Math.log10(Math.abs(num)) / 3 | 0
  
  if (tier === 0) return num.toString()
  
  const suffix = suffixes[tier]
  const scale = Math.pow(10, tier * 3)
  const scaled = num / scale
  
  return scaled.toFixed(1).replace(/\.0$/, '') + suffix
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }
  
  return 'Just now'
}

/**
 * Format date to readable string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  return new Date(date).toLocaleDateString('en-US', options)
}

/**
 * Format date and time
 */
export function formatDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  return new Date(date).toLocaleString('en-US', options)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Format video resolution
 */
export function formatResolution(width: number, height: number): string {
  // Common resolution names
  const resolutions: Record<string, string> = {
    '1920x1080': '1080p (Full HD)',
    '1280x720': '720p (HD)',
    '854x480': '480p',
    '640x360': '360p',
    '426x240': '240p',
    '3840x2160': '4K (Ultra HD)',
    '2560x1440': '1440p (2K)'
  }
  
  const key = `${width}x${height}`
  return resolutions[key] || `${width}×${height}`
}

/**
 * Format bitrate
 */
export function formatBitrate(bps: number): string {
  if (bps < 1000) return `${bps} bps`
  if (bps < 1000000) return `${(bps / 1000).toFixed(1)} Kbps`
  return `${(bps / 1000000).toFixed(1)} Mbps`
}

/**
 * Format frame rate
 */
export function formatFrameRate(fps: number): string {
  return `${fps} fps`
}

/**
 * Calculate and format video aspect ratio
 */
export function formatAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }
  
  const divisor = gcd(width, height)
  const aspectWidth = width / divisor
  const aspectHeight = height / divisor
  
  // Common aspect ratio names
  const ratios: Record<string, string> = {
    '16:9': 'Widescreen',
    '4:3': 'Standard',
    '21:9': 'Ultrawide',
    '1:1': 'Square',
    '9:16': 'Vertical'
  }
  
  const ratio = `${aspectWidth}:${aspectHeight}`
  return ratios[ratio] ? `${ratio} (${ratios[ratio]})` : ratio
}

/**
 * Format engagement rate
 */
export function formatEngagementRate(
  interactions: number,
  views: number
): string {
  if (views === 0) return '0%'
  const rate = (interactions / views) * 100
  return `${rate.toFixed(1)}%`
}

/**
 * Format watch time percentage
 */
export function formatWatchTimePercentage(
  watchTime: number,
  totalDuration: number
): string {
  if (totalDuration === 0) return '0%'
  const percentage = (watchTime / totalDuration) * 100
  return `${Math.min(100, percentage).toFixed(1)}%`
}

/**
 * Format subscriber count with appropriate suffix
 */
export function formatSubscriberCount(count: number): string {
  if (count === 1) return '1 subscriber'
  if (count < 1000) return `${count} subscribers`
  
  const formatted = formatNumber(count)
  return `${formatted} subscribers`
}

/**
 * Format view count
 */
export function formatViewCount(count: number): string {
  if (count === 1) return '1 view'
  if (count < 1000) return `${count} views`
  
  const formatted = formatNumber(count)
  return `${formatted} views`
}

/**
 * Format upload speed
 */
export function formatUploadSpeed(bytesPerSecond: number): string {
  const mbps = (bytesPerSecond * 8) / (1024 * 1024)
  return `${mbps.toFixed(1)} Mbps`
}

/**
 * Format remaining time for uploads
 */
export function formatRemainingTime(
  uploadedBytes: number,
  totalBytes: number,
  bytesPerSecond: number
): string {
  if (bytesPerSecond === 0) return 'Calculating...'
  
  const remainingBytes = totalBytes - uploadedBytes
  const remainingSeconds = remainingBytes / bytesPerSecond
  
  return formatDuration(remainingSeconds)
}

/**
 * Format video quality label
 */
export function formatQualityLabel(
  width: number,
  height: number,
  bitrate?: number
): string {
  const resolution = formatResolution(width, height)
  if (bitrate) {
    const bitrateFormatted = formatBitrate(bitrate)
    return `${resolution} (${bitrateFormatted})`
  }
  return resolution
}

/**
 * Format storage usage
 */
export function formatStorageUsage(
  used: number,
  total: number
): { used: string; total: string; percentage: number } {
  return {
    used: formatFileSize(used),
    total: formatFileSize(total),
    percentage: total > 0 ? (used / total) * 100 : 0
  }
}

/**
 * Format bandwidth usage
 */
export function formatBandwidth(bytesPerSecond: number): string {
  return `${formatFileSize(bytesPerSecond)}/s`
}

/**
 * Format analytics time range
 */
export function formatTimeRange(startDate: Date, endDate: Date): string {
  const start = formatDate(startDate, { month: 'short', day: 'numeric' })
  const end = formatDate(endDate, { month: 'short', day: 'numeric' })
  
  if (start === end) return start
  return `${start} - ${end}`
}

/**
 * Format revenue with proper currency symbol
 */
export function formatRevenue(
  amount: number,
  currency: string = 'USD'
): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  }
  
  const symbol = symbols[currency] || currency
  const formatted = formatNumber(amount)
  
  return `${symbol}${formatted}`
}

/**
 * Format CPM (Cost Per Mille)
 */
export function formatCPM(revenue: number, impressions: number): string {
  if (impressions === 0) return '$0.00'
  const cpm = (revenue / impressions) * 1000
  return formatCurrency(cpm)
}
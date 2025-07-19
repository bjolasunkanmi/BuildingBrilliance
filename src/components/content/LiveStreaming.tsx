'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  NoSymbolIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  ShareIcon,
  StopIcon,
  PlayIcon,
  EyeIcon,
  HeartIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatNumber } from '@/utils/format'
import { useLiveStream } from '@/hooks/useLiveStream'
import { useAuth } from '@/hooks/useAuth'

interface StreamSettings {
  title: string
  description: string
  category: string
  visibility: 'public' | 'private' | 'subscribers'
  enableChat: boolean
  enableDonations: boolean
  maxViewers?: number
}

interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  message: string
  timestamp: Date
  type: 'message' | 'donation' | 'system'
  amount?: number
}

interface LiveStreamingProps {
  streamKey?: string
  onStreamStart?: (streamData: any) => void
  onStreamEnd?: () => void
  className?: string
}

export function LiveStreaming({
  streamKey,
  onStreamStart,
  onStreamEnd,
  className = ''
}: LiveStreamingProps) {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const [isStreaming, setIsStreaming] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [streamDuration, setStreamDuration] = useState(0)
  const [totalHearts, setTotalHearts] = useState(0)
  const [settings, setSettings] = useState<StreamSettings>({
    title: '',
    description: '',
    category: 'FINANCIAL_LITERACY',
    visibility: 'public',
    enableChat: true,
    enableDonations: true
  })

  const {
    initializeStream,
    startStream,
    stopStream,
    sendChatMessage,
    isConnected,
    streamStats,
    error
  } = useLiveStream({
    streamKey,
    onViewerUpdate: setViewerCount,
    onChatMessage: (message) => {
      setChatMessages(prev => [...prev, message])
    }
  })

  // Stream duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStreaming])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const getMediaStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      
      return mediaStream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw error
    }
  }

  const startPreview = async () => {
    try {
      const mediaStream = await getMediaStream()
      setIsPreview(true)
    } catch (error) {
      console.error('Failed to start preview:', error)
    }
  }

  const stopPreview = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsPreview(false)
  }

  const handleStartStream = async () => {
    if (!settings.title.trim()) {
      alert('Please enter a stream title')
      return
    }

    try {
      const mediaStream = stream || await getMediaStream()
      
      await initializeStream({
        stream: mediaStream,
        settings
      })
      
      await startStream()
      
      setIsStreaming(true)
      setStreamDuration(0)
      onStreamStart?.({
        title: settings.title,
        startTime: new Date(),
        settings
      })
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        username: 'System',
        message: `${user?.username || 'Host'} started the stream`,
        timestamp: new Date(),
        type: 'system'
      }
      setChatMessages([systemMessage])
      
    } catch (error) {
      console.error('Failed to start stream:', error)
    }
  }

  const handleStopStream = async () => {
    try {
      await stopStream()
      setIsStreaming(false)
      setIsPreview(false)
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      
      onStreamEnd?.()
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        username: 'System',
        message: 'Stream ended',
        timestamp: new Date(),
        type: 'system'
      }
      setChatMessages(prev => [...prev, systemMessage])
      
    } catch (error) {
      console.error('Failed to stop stream:', error)
    }
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'message'
    }

    sendChatMessage(message)
    setNewMessage('')
  }

  const handleSendHeart = () => {
    setTotalHearts(prev => prev + 1)
    // Send heart animation
    const heartElement = document.createElement('div')
    heartElement.innerHTML = '❤️'
    heartElement.className = 'absolute text-2xl animate-bounce pointer-events-none'
    heartElement.style.left = Math.random() * 100 + '%'
    heartElement.style.bottom = '20px'
    
    document.body.appendChild(heartElement)
    
    setTimeout(() => {
      document.body.removeChild(heartElement)
    }, 2000)
  }

  const formatStreamDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Stream Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stream Preview/Live */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Stream Overlay */}
            {(isPreview || isStreaming) && (
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {isStreaming && (
                    <Badge variant="danger" className="animate-pulse">
                      🔴 LIVE
                    </Badge>
                  )}
                  
                  <div className="flex items-center space-x-2 bg-black/50 rounded-lg px-3 py-1 text-white text-sm">
                    <EyeIcon className="h-4 w-4" />
                    <span>{formatNumber(viewerCount)}</span>
                  </div>
                  
                  {isStreaming && (
                    <div className="bg-black/50 rounded-lg px-3 py-1 text-white text-sm">
                      {formatStreamDuration(streamDuration)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSendHeart}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    <HeartSolidIcon className="h-4 w-4 text-red-500" />
                    <span className="ml-1">{formatNumber(totalHearts)}</span>
                  </Button>
                </div>
              </div>
            )}
            
            {/* No Stream State */}
            {!isPreview && !isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <VideoCameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Ready to go live?</h3>
                  <p className="text-sm opacity-75">Start your preview to set up your stream</p>
                </div>
              </div>
            )}
            
            {/* Stream Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVideo}
                  className={`${
                    isVideoEnabled 
                      ? 'bg-black/50 text-white hover:bg-black/70' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isVideoEnabled ? (
                    <VideoCameraIcon className="h-4 w-4" />
                  ) : (
                    <VideoCameraSlashIcon className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAudio}
                  className={`${
                    isAudioEnabled 
                      ? 'bg-black/50 text-white hover:bg-black/70' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isAudioEnabled ? (
                    <MicrophoneIcon className="h-4 w-4" />
                  ) : (
                    <NoSymbolIcon className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isStreaming ? (
                  <>
                    {!isPreview ? (
                      <Button onClick={startPreview}>
                        Start Preview
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={stopPreview}>
                          Stop Preview
                        </Button>
                        <Button onClick={handleStartStream}>
                          Go Live
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <Button variant="danger" onClick={handleStopStream}>
                    <StopIcon className="h-4 w-4 mr-2" />
                    End Stream
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Stream Settings */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card p-4 space-y-4"
              >
                <h3 className="text-lg font-semibold">Stream Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stream Title *
                    </label>
                    <Input
                      value={settings.title}
                      onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What are you streaming about?"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={settings.category}
                      onChange={(e) => setSettings(prev => ({ ...prev, category: e.target.value }))}
                      className="input w-full"
                    >
                      <option value="FINANCIAL_LITERACY">Financial Literacy</option>
                      <option value="INVESTING">Investing</option>
                      <option value="CRYPTOCURRENCY">Cryptocurrency</option>
                      <option value="PERSONAL_FINANCE">Personal Finance</option>
                      <option value="TRADING">Trading</option>
                      <option value="ECONOMICS">Economics</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you'll be covering in this stream..."
                    rows={3}
                    maxLength={500}
                    className="input w-full"
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableChat}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableChat: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Enable chat</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableDonations}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableDonations: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Enable donations</span>
                  </label>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                  >
                    Close Settings
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stream Stats */}
          {isStreaming && streamStats && (
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">Stream Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatNumber(viewerCount)}
                  </div>
                  <div className="text-sm text-gray-600">Current Viewers</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(streamStats.peakViewers || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Peak Viewers</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(totalHearts)}
                  </div>
                  <div className="text-sm text-gray-600">Hearts</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatStreamDuration(streamDuration)}
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Panel */}
        <div className="lg:col-span-1">
          <div className="card h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold flex items-center">
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                Live Chat
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(!showChat)}
              >
                {showChat ? <XMarkIcon className="h-4 w-4" /> : <ChatBubbleLeftIcon className="h-4 w-4" />}
              </Button>
            </div>
            
            {showChat && (
              <>
                {/* Chat Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`${
                        message.type === 'system' 
                          ? 'text-center text-sm text-gray-500 italic'
                          : 'flex items-start space-x-2'
                      }`}
                    >
                      {message.type === 'system' ? (
                        <span>{message.message}</span>
                      ) : (
                        <>
                          <Avatar
                            src={message.avatar}
                            alt={message.username}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {message.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 break-words">
                              {message.message}
                            </p>
                            {message.type === 'donation' && message.amount && (
                              <div className="mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                💰 ${message.amount} donation
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Chat Input */}
                {settings.enableChat && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Say something..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                        maxLength={200}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {newMessage.length}/200
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSendHeart}
                        className="text-red-500 hover:text-red-600"
                      >
                        <HeartIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for stream processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
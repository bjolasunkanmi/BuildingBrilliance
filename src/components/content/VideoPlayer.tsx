'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Cog6ToothIcon,
  ForwardIcon,
  BackwardIcon,
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { formatDuration } from '@/utils/format'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'

interface VideoSource {
  quality: string
  url: string
  type: string
}

interface VideoPlayerProps {
  sources: VideoSource[]
  title: string
  description?: string
  thumbnail?: string
  poster?: string
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onLoadedMetadata?: (duration: number) => void
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function VideoPlayer({
  sources,
  title,
  description,
  thumbnail,
  poster,
  autoPlay = false,
  muted = false,
  controls = true,
  className = '',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onLoadedMetadata
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [selectedQuality, setSelectedQuality] = useState(sources[0]?.quality || 'auto')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Video interactions
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)

  const controlsTimeout = useRef<NodeJS.Timeout>()

  const {
    pictureInPictureSupported,
    requestPictureInPicture,
    exitPictureInPicture,
    isPictureInPicture
  } = useVideoPlayer(videoRef)

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }
    setShowControls(true)
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])

  useEffect(() => {
    resetControlsTimeout()
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [resetControlsTimeout])

  // Video event handlers
  const handlePlay = () => {
    setIsPlaying(true)
    onPlay?.()
  }

  const handlePause = () => {
    setIsPlaying(false)
    onPause?.()
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      setCurrentTime(current)
      onTimeUpdate?.(current)

      // Update buffered
      const bufferedEnd = videoRef.current.buffered.length > 0 
        ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
        : 0
      setBuffered(bufferedEnd)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      onLoadedMetadata?.(videoDuration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    onEnded?.()
  }

  const handleLoadStart = () => {
    setIsLoading(true)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  // Control handlers
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted
      videoRef.current.muted = newMuted
      setIsMuted(newMuted)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      handleSeek(newTime)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  const changeQuality = (quality: string) => {
    const source = sources.find(s => s.quality === quality)
    if (source && videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const wasPlaying = isPlaying
      
      videoRef.current.src = source.url
      videoRef.current.load()
      
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime
          if (wasPlaying) {
            videoRef.current.play()
          }
        }
      }, { once: true })
      
      setSelectedQuality(quality)
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }

  // Interaction handlers
  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1)
      setIsLiked(false)
    } else {
      setLikes(prev => prev + 1)
      setIsLiked(true)
      if (isDisliked) {
        setDislikes(prev => prev - 1)
        setIsDisliked(false)
      }
    }
  }

  const handleDislike = () => {
    if (isDisliked) {
      setDislikes(prev => prev - 1)
      setIsDisliked(false)
    } else {
      setDislikes(prev => prev + 1)
      setIsDisliked(true)
      if (isLiked) {
        setLikes(prev => prev - 1)
        setIsLiked(false)
      }
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href
        })
      } catch (error) {
        console.error('Share error:', error)
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlayPause()
          break
        case 'm':
          toggleMute()
          break
        case 'f':
          toggleFullscreen()
          break
        case 'ArrowLeft':
          skip(-10)
          break
        case 'ArrowRight':
          skip(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange(Math.max(0, volume - 0.1))
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [volume, togglePlayPause, toggleMute, toggleFullscreen])

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster || thumbnail}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onClick={togglePlayPause}
      >
        {sources.map((source) => (
          <source
            key={source.quality}
            src={source.url}
            type={source.type}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause Overlay */}
      <AnimatePresence>
        {!isPlaying && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlayPause}
              className="bg-black/50 text-white hover:bg-black/70 w-16 h-16 rounded-full"
            >
              <PlayIcon className="h-8 w-8 ml-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {controls && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="mb-4 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = (e.clientX - rect.left) / rect.width
                  handleSeek(percent * duration)
                }}
              >
                <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                  {/* Buffered */}
                  <div
                    className="absolute top-0 left-0 h-full bg-white/50"
                    style={{ width: `${(buffered / duration) * 100}%` }}
                  />
                  {/* Progress */}
                  <div
                    className="absolute top-0 left-0 h-full bg-primary-500"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                  />
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-5 w-5" />
                    ) : (
                      <PlayIcon className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Skip Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <BackwardIcon className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <ForwardIcon className="h-5 w-5" />
                  </Button>

                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted || volume === 0 ? (
                        <SpeakerXMarkIcon className="h-5 w-5" />
                      ) : (
                        <SpeakerWaveIcon className="h-5 w-5" />
                      )}
                    </Button>

                    {showVolumeSlider && (
                      <div
                        className="w-20"
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <Slider
                          value={[volume]}
                          onValueChange={([value]) => handleVolumeChange(value)}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-sm font-mono">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Settings */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white hover:bg-white/20"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </Button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-4 min-w-[200px]">
                        {/* Quality */}
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Quality</h4>
                          {sources.map((source) => (
                            <button
                              key={source.quality}
                              onClick={() => changeQuality(source.quality)}
                              className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 ${
                                selectedQuality === source.quality ? 'text-primary-400' : ''
                              }`}
                            >
                              {source.quality}
                            </button>
                          ))}
                        </div>

                        {/* Playback Speed */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Speed</h4>
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 ${
                                playbackSpeed === speed ? 'text-primary-400' : ''
                              }`}
                            >
                              {speed === 1 ? 'Normal' : `${speed}x`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Picture in Picture */}
                  {pictureInPictureSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isPictureInPicture ? exitPictureInPicture : requestPictureInPicture}
                      className="text-white hover:bg-white/20"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                      </svg>
                    </Button>
                  )}

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? (
                      <ArrowsPointingInIcon className="h-5 w-5" />
                    ) : (
                      <ArrowsPointingOutIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Video Actions (Below Player) */}
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${isLiked ? 'text-primary-600' : ''}`}
          >
            {isLiked ? (
              <HandThumbUpSolidIcon className="h-5 w-5" />
            ) : (
              <HandThumbUpIcon className="h-5 w-5" />
            )}
            <span>{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            className={`flex items-center space-x-2 ${isDisliked ? 'text-red-600' : ''}`}
          >
            {isDisliked ? (
              <HandThumbDownSolidIcon className="h-5 w-5" />
            ) : (
              <HandThumbDownIcon className="h-5 w-5" />
            )}
            <span>{dislikes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <ShareIcon className="h-5 w-5" />
            <span>Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`flex items-center space-x-2 ${isSaved ? 'text-primary-600' : ''}`}
          >
            {isSaved ? (
              <BookmarkSolidIcon className="h-5 w-5" />
            ) : (
              <BookmarkIcon className="h-5 w-5" />
            )}
            <span>Save</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
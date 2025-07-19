'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloudArrowUpIcon,
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { CONTENT_CATEGORIES, UPLOAD_LIMITS } from '@/lib/constants'
import { useVideoUpload } from '@/hooks/useVideoUpload'
import { formatFileSize, formatDuration } from '@/utils/format'

interface VideoFile extends File {
  id: string
  preview?: string
  thumbnail?: string
  duration?: number
  dimensions?: { width: number; height: number }
}

interface VideoMetadata {
  title: string
  description: string
  category: string
  tags: string[]
  thumbnail?: string
  visibility: 'public' | 'private' | 'unlisted'
  monetization: boolean
  ageRestriction: boolean
  allowComments: boolean
  allowDownloads: boolean
}

interface VideoUploaderProps {
  onUploadComplete?: (videoData: any) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  className?: string
}

export function VideoUploader({
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  className = ''
}: VideoUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<VideoFile[]>([])
  const [currentFile, setCurrentFile] = useState<VideoFile | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    description: '',
    category: '',
    tags: [],
    visibility: 'public',
    monetization: true,
    ageRestriction: false,
    allowComments: true,
    allowDownloads: false
  })
  const [tagInput, setTagInput] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('')
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const {
    uploadProgress,
    isUploading,
    uploadVideo,
    processingStatus
  } = useVideoUpload()

  // Generate video thumbnail at specific time
  const generateThumbnail = useCallback((video: HTMLVideoElement, time: number = 0): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      if (!canvas) return resolve('')

      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve('')

      video.currentTime = time
      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve(url)
          }
        }, 'image/jpeg', 0.8)
      }
    })
  }, [])

  // Extract video metadata
  const extractVideoMetadata = useCallback(async (file: VideoFile): Promise<VideoFile> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = async () => {
        const updatedFile = {
          ...file,
          duration: video.duration,
          dimensions: {
            width: video.videoWidth,
            height: video.videoHeight
          }
        }

        // Generate multiple thumbnails
        const thumbnails: string[] = []
        const intervals = [0, video.duration * 0.25, video.duration * 0.5, video.duration * 0.75]
        
        for (const time of intervals) {
          const thumbnail = await generateThumbnail(video, time)
          if (thumbnail) thumbnails.push(thumbnail)
        }
        
        setGeneratedThumbnails(thumbnails)
        setSelectedThumbnail(thumbnails[0] || '')
        
        resolve(updatedFile)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }, [generateThumbnail])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFiles = acceptedFiles.map((file) => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file)
    })) as VideoFile[]

    // Process each file to extract metadata
    const processedFiles: VideoFile[] = []
    for (const file of videoFiles) {
      try {
        const processedFile = await extractVideoMetadata(file)
        processedFiles.push(processedFile)
      } catch (error) {
        console.error('Error processing video file:', error)
        processedFiles.push(file)
      }
    }

    setUploadedFiles(prev => [...prev, ...processedFiles])
    if (processedFiles.length > 0) {
      setCurrentFile(processedFiles[0])
      // Auto-generate title from filename
      const filename = processedFiles[0].name.replace(/\.[^/.]+$/, "")
      setMetadata(prev => ({ ...prev, title: filename }))
    }
  }, [extractVideoMetadata])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'video/*': UPLOAD_LIMITS.VIDEO.allowedTypes
    },
    maxSize: UPLOAD_LIMITS.VIDEO.maxSize,
    maxFiles,
    multiple: maxFiles > 1
  })

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    if (currentFile?.id === fileId) {
      const remaining = uploadedFiles.filter(file => file.id !== fileId)
      setCurrentFile(remaining.length > 0 ? remaining[0] : null)
    }
  }

  const handleUpload = async () => {
    if (!currentFile) return

    try {
      const uploadData = {
        file: currentFile,
        metadata: {
          ...metadata,
          thumbnail: selectedThumbnail,
          duration: currentFile.duration,
          dimensions: currentFile.dimensions
        }
      }

      const result = await uploadVideo(uploadData)
      onUploadComplete?.(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onUploadError?.(errorMessage)
    }
  }

  const canUpload = currentFile && metadata.title.trim() && metadata.category && !isUploading

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Upload Area */}
      {uploadedFiles.length === 0 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop your video here' : 'Upload your video'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop a video file, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports MP4, MOV, AVI up to {formatFileSize(UPLOAD_LIMITS.VIDEO.maxSize)}
          </p>
        </div>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-error-500 mr-2" />
            <h3 className="text-sm font-medium text-error-800">Upload Error</h3>
          </div>
          <div className="mt-2 text-sm text-error-700">
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Preview and Metadata */}
      {currentFile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Video Preview</h3>
            
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={currentFile.preview}
                className="w-full h-auto"
                onLoadedData={() => {
                  if (videoRef.current) {
                    setIsPlaying(false)
                    setIsMuted(videoRef.current.muted)
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMuteToggle}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="h-4 w-4" />
                    ) : (
                      <SpeakerWaveIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {currentFile.duration ? formatDuration(currentFile.duration) : '--:--'}
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">File size:</span>
                <span>{formatFileSize(currentFile.size)}</span>
              </div>
              {currentFile.dimensions && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resolution:</span>
                  <span>{currentFile.dimensions.width} × {currentFile.dimensions.height}</span>
                </div>
              )}
              {currentFile.duration && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span>{formatDuration(currentFile.duration)}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Selection */}
            {generatedThumbnails.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-medium">Select Thumbnail</h4>
                <div className="grid grid-cols-2 gap-3">
                  {generatedThumbnails.map((thumbnail, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedThumbnail === thumbnail
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedThumbnail(thumbnail)}
                    >
                      <img
                        src={thumbnail}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      {selectedThumbnail === thumbnail && (
                        <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                          <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Video Details</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title..."
                maxLength={100}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {metadata.title.length}/100 characters
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell viewers about your video..."
                rows={4}
                maxLength={5000}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {metadata.description.length}/5000 characters
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <Select
                value={metadata.category}
                onChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}
                placeholder="Select a category..."
                options={CONTENT_CATEGORIES.map(cat => ({
                  value: cat.value,
                  label: `${cat.icon} ${cat.label}`
                }))}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1"
                />
                <Button onClick={handleAddTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>
              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <XMarkIcon className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <Select
                value={metadata.visibility}
                onChange={(value) => setMetadata(prev => ({ ...prev, visibility: value as any }))}
                options={[
                  { value: 'public', label: '🌍 Public - Anyone can watch' },
                  { value: 'unlisted', label: '🔗 Unlisted - Only with link' },
                  { value: 'private', label: '🔒 Private - Only you can watch' }
                ]}
              />
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <h4 className="text-md font-medium">Settings</h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={metadata.monetization}
                  onChange={(e) => setMetadata(prev => ({ ...prev, monetization: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Enable monetization</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={metadata.allowComments}
                  onChange={(e) => setMetadata(prev => ({ ...prev, allowComments: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Allow comments</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={metadata.allowDownloads}
                  onChange={(e) => setMetadata(prev => ({ ...prev, allowDownloads: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Allow downloads</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={metadata.ageRestriction}
                  onChange={(e) => setMetadata(prev => ({ ...prev, ageRestriction: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Age restriction (18+)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Uploading Video...</h3>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          
          <Progress value={uploadProgress} className="mb-4" />
          
          {processingStatus && (
            <div className="text-sm text-gray-600">
              Status: {processingStatus}
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {currentFile && !isUploading && (
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentFile(null)
              setUploadedFiles([])
              setMetadata({
                title: '',
                description: '',
                category: '',
                tags: [],
                visibility: 'public',
                monetization: true,
                ageRestriction: false,
                allowComments: true,
                allowDownloads: false
              })
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={!canUpload}
            className="min-w-[120px]"
          >
            Upload Video
          </Button>
        </div>
      )}

      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
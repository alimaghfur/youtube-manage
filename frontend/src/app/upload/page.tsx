'use client'

import { useState, useEffect } from 'react'
import { getReadyVideos, uploadVideo } from '@/lib/api'

export default function Upload() {
  const [videos, setVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('education')
  const [visibility, setVisibility] = useState('public')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const result = await getReadyVideos()
      setVideos(result.videos || [])
    } catch (e) {
      console.error('Failed to load videos:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVideo = (video: any) => {
    setSelectedVideo(video.id)
    setTitle(video.title || video.keyword)
    setDescription(`${video.title || video.keyword}\n\n#${video.niche} #youtube`)
    setTags(video.niche || '')
  }

  const handleUpload = async () => {
    if (!selectedVideo) return
    setUploading(true)
    setMessage('')
    try {
      const result = await uploadVideo({
        video_id: selectedVideo,
        title,
        description,
        tags,
        category,
        visibility,
      })
      if (result.status === 'pending_auth') {
        setMessage('YouTube OAuth setup required. Please connect your YouTube channel in Settings first.')
      } else {
        setMessage('Video uploaded successfully!')
        loadVideos()
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload to YouTube</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your generated videos directly to YouTube</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : message.includes('OAuth') ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2 card p-6 space-y-6">
          {/* Video Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Video</label>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedVideo === video.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{video.title || video.keyword}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{video.niche} • {video.duration_target}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No videos ready for upload</p>
                <a href="/generate" className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-1 inline-block">Generate a video first</a>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="input-field"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description..."
              rows={5}
              className="input-field resize-none"
              maxLength={5000}
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/5000 characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate tags with comma (e.g. fakta, unik, sains)"
              className="input-field"
            />
          </div>

          {/* Category & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-field">
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="science">Science & Technology</option>
                <option value="howto">Howto & Style</option>
                <option value="people">People & Blogs</option>
                <option value="news">News & Politics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="select-field">
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <div className="pt-4">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedVideo || !title}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                uploading || !selectedVideo || !title
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload to YouTube
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="card p-6 h-fit space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview</h3>
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {title || 'Video title will appear here'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
              {description || 'Video description will appear here...'}
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Visibility</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{visibility}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Category</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

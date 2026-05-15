'use client'

import { useState, useEffect } from 'react'
import { getVideos, deleteVideo } from '@/lib/api'

export default function Library() {
  const [filter, setFilter] = useState('all')
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadVideos()
  }, [filter])

  const loadVideos = async () => {
    setLoading(true)
    try {
      const status = filter === 'all' ? undefined : filter
      const result = await getVideos(status)
      setVideos(result.videos)
      setTotal(result.total)
    } catch (e) {
      console.error('Failed to load videos:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    try {
      await deleteVideo(id)
      loadVideos()
    } catch (e) {
      console.error('Failed to delete:', e)
    }
  }

  const statusColors: Record<string, string> = {
    ready: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    uploaded: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    generating: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">All your generated videos in one place</p>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{total} videos</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'ready', label: 'Ready to Upload' },
          { id: 'uploaded', label: 'Uploaded' },
          { id: 'generating', label: 'Generating' },
          { id: 'failed', label: 'Failed' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === f.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Video Grid */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card-hover overflow-hidden group">
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                  {video.title || video.keyword}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {video.created_at ? new Date(video.created_at).toLocaleDateString() : ''}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[video.status] || ''}`}>
                    {video.status}
                  </span>
                </div>
                <div className="mt-2 flex gap-1">
                  {video.niche && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                      {video.niche}
                    </span>
                  )}
                  {video.video_type && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                      {video.video_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No videos found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {filter !== 'all' ? 'Try changing the filter' : 'Generate your first video to get started'}
          </p>
        </div>
      )}
    </div>
  )
}

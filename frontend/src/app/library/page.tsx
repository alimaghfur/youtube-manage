'use client'

import { useState } from 'react'

export default function Library() {
  const [filter, setFilter] = useState('all')

  const videos = [
    { id: 1, title: '5 Fakta Unik Tentang Luar Angkasa', niche: 'Sains', duration: '3:45', date: '2026-05-14', status: 'uploaded', thumbnail: null },
    { id: 2, title: 'Tips Produktivitas untuk Programmer', niche: 'Teknologi', duration: '5:12', date: '2026-05-13', status: 'uploaded', thumbnail: null },
    { id: 3, title: 'Sejarah Internet yang Jarang Diketahui', niche: 'Sejarah', duration: '4:30', date: '2026-05-12', status: 'ready', thumbnail: null },
    { id: 4, title: 'Motivasi Pagi untuk Sukses', niche: 'Motivasi', duration: '2:15', date: '2026-05-11', status: 'ready', thumbnail: null },
  ]

  const filtered = filter === 'all' ? videos : videos.filter(v => v.status === filter)

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">All your generated videos in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{videos.length} videos</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'uploaded', label: 'Uploaded' },
          { id: 'ready', label: 'Ready to Upload' },
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

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((video) => (
          <div key={video.id} className="card-hover overflow-hidden group">
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-medium px-2 py-0.5 rounded">
                {video.duration}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </button>
                <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{video.title}</h3>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">{video.date}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  video.status === 'uploaded'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {video.status === 'uploaded' ? 'Uploaded' : 'Ready'}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  {video.niche}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

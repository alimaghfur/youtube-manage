'use client'

import { useState, useEffect } from 'react'
import { fetchAPI, getVideos } from '@/lib/api'

export default function RemixPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [clipCount, setClipCount] = useState(3)
  const [ratio, setRatio] = useState('9:16')
  const [highlightDuration, setHighlightDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => { loadVideos() }, [])

  const loadVideos = async () => {
    try {
      const res = await getVideos()
      setVideos((res.videos || []).filter((v: any) => v.video_path))
    } catch (e) {}
  }

  const handleShorts = async () => {
    if (!selectedId) return
    setLoading(true); setMessage(''); setResult(null)
    try {
      const res = await fetchAPI('/remix/shorts', { method: 'POST', body: JSON.stringify({ video_id: selectedId, clip_count: clipCount }) })
      setResult(res); setMessage(`Created ${res.shorts_created} Shorts!`)
    } catch (e: any) { setMessage(`Error: ${e.message}`) } finally { setLoading(false) }
  }

  const handleAspectRatio = async () => {
    if (!selectedId) return
    setLoading(true); setMessage(''); setResult(null)
    try {
      const res = await fetchAPI('/remix/aspect-ratio', { method: 'POST', body: JSON.stringify({ video_id: selectedId, ratio }) })
      setResult(res); setMessage(`Converted to ${ratio} format!`)
    } catch (e: any) { setMessage(`Error: ${e.message}`) } finally { setLoading(false) }
  }

  const handleHighlight = async () => {
    if (!selectedId) return
    setLoading(true); setMessage(''); setResult(null)
    try {
      const res = await fetchAPI('/remix/highlight', { method: 'POST', body: JSON.stringify({ video_id: selectedId, duration: highlightDuration }) })
      setResult(res); setMessage(`Highlight reel created (${highlightDuration}s)!`)
    } catch (e: any) { setMessage(`Error: ${e.message}`) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Remix</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Repurpose your videos into Shorts, Reels, and more</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>{message}</div>
      )}

      {/* Select Video */}
      <div className="card p-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select Video to Remix</label>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
            {videos.map((v) => (
              <button key={v.id} onClick={() => setSelectedId(v.id)} className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${selectedId === v.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <p className="font-medium text-gray-900 dark:text-white truncate">{v.title || v.keyword}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{v.niche} • {v.status}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No videos with files available. Generate videos first.</p>
        )}
      </div>

      {/* Remix Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Shorts */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">YouTube Shorts</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Split into vertical clips</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of clips</label>
            <div className="flex gap-2">
              {[2, 3, 5, 7].map((n) => (
                <button key={n} onClick={() => setClipCount(n)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${clipCount === n ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={handleShorts} disabled={loading || !selectedId} className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${loading || !selectedId ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
            {loading ? 'Processing...' : 'Create Shorts'}
          </button>
        </div>

        {/* Aspect Ratio */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Change Ratio</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Resize for platforms</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target format</label>
            <select value={ratio} onChange={(e) => setRatio(e.target.value)} className="select-field">
              <option value="9:16">9:16 Vertical (Shorts/TikTok)</option>
              <option value="1:1">1:1 Square (Instagram)</option>
              <option value="4:5">4:5 Portrait (Instagram Feed)</option>
            </select>
          </div>
          <button onClick={handleAspectRatio} disabled={loading || !selectedId} className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${loading || !selectedId ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            {loading ? 'Processing...' : 'Convert'}
          </button>
        </div>

        {/* Highlight Reel */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Highlight Reel</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Best moments clip</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Duration (seconds)</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((n) => (
                <button key={n} onClick={() => setHighlightDuration(n)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${highlightDuration === n ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{n}s</button>
              ))}
            </div>
          </div>
          <button onClick={handleHighlight} disabled={loading || !selectedId} className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${loading || !selectedId ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
            {loading ? 'Processing...' : 'Create Highlight'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && result.clips && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Generated Clips</h3>
          <div className="space-y-2">
            {result.clips.map((clip: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{clip.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration: {Math.round(clip.duration)}s</p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">Ready</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

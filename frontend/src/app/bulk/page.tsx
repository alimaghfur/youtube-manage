'use client'

import { useState } from 'react'
import { fetchAPI } from '@/lib/api'

export default function BulkPage() {
  const [keywords, setKeywords] = useState('')
  const [niche, setNiche] = useState('')
  const [videoType, setVideoType] = useState('slideshow')
  const [language, setLanguage] = useState('id')
  const [voice, setVoice] = useState('edge-tts')
  const [duration, setDuration] = useState('medium')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [trendingCount, setTrendingCount] = useState(5)

  const niches = ['Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan', 'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga']

  const handleBulkGenerate = async () => {
    const kwList = keywords.split('\n').map(k => k.trim()).filter(k => k)
    if (!kwList.length || !niche) return
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetchAPI('/bulk/generate', {
        method: 'POST',
        body: JSON.stringify({ keywords: kwList, niche, video_type: videoType, language, voice_engine: voice, duration_target: duration }),
      })
      setResult(res)
      setMessage(`Started generating ${res.total} videos!`)
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleTrendingGenerate = async () => {
    if (!niche) return
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetchAPI('/bulk/from-trending', {
        method: 'POST',
        body: JSON.stringify({ niche, count: trendingCount, video_type: videoType, language, voice_engine: voice, duration_target: duration }),
      })
      setResult(res)
      setMessage(`Started generating ${res.total} videos from trending topics!`)
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Generate</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Generate multiple videos at once — perfect for batch content creation</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Bulk */}
        <div className="card p-6 space-y-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">From Keywords</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Keywords (one per line)</label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={"5 fakta unik tentang luar angkasa\nteknologi AI terbaru 2026\ntips produktivitas pagi hari"}
              rows={6}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{keywords.split('\n').filter(k => k.trim()).length} keywords</p>
          </div>
          <button
            onClick={handleBulkGenerate}
            disabled={generating || !keywords.trim() || !niche}
            className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${generating || !keywords.trim() || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-lg'}`}
          >
            {generating ? 'Generating...' : 'Bulk Generate from Keywords'}
          </button>
        </div>

        {/* From Trending */}
        <div className="card p-6 space-y-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">From Trending Topics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Auto-find trending keywords and generate videos from them</p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Videos</label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setTrendingCount(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${trendingCount === n ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleTrendingGenerate}
            disabled={generating || !niche}
            className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${generating || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'}`}
          >
            {generating ? 'Generating...' : `Generate ${trendingCount} from Trending`}
          </button>
        </div>
      </div>

      {/* Shared Settings */}
      <div className="card p-6 space-y-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Video Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Niche</label>
            <select value={niche} onChange={(e) => setNiche(e.target.value)} className="select-field">
              <option value="">Select niche</option>
              {niches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select value={videoType} onChange={(e) => setVideoType(e.target.value)} className="select-field">
              <option value="slideshow">Slideshow + Narasi</option>
              <option value="text-screen">Text on Screen</option>
              <option value="listicle">Fakta/Listicle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select-field">
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="select-field">
              <option value="short">Short (~1 min)</option>
              <option value="medium">Medium (3-5 min)</option>
              <option value="long">Long (8-10 min)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Generation Started</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {result.total} videos are being generated. Check the <a href="/library" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Library</a> for progress.
          </p>
        </div>
      )}
    </div>
  )
}

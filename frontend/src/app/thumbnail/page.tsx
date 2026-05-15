'use client'

import { useState, useEffect } from 'react'
import { fetchAPI, getVideos } from '@/lib/api'

export default function ThumbnailPage() {
  const [title, setTitle] = useState('')
  const [niche, setNiche] = useState('')
  const [videoId, setVideoId] = useState<number | null>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [message, setMessage] = useState('')

  const niches = ['Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan', 'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga']

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const res = await getVideos()
      setVideos(res.videos || [])
    } catch (e) { }
  }

  const handleGenerate = async () => {
    if (!title || !niche) return
    setGenerating(true)
    setMessage('')
    setResult(null)
    try {
      const res = await fetchAPI('/thumbnail/generate', {
        method: 'POST',
        body: JSON.stringify({ title, niche, video_id: videoId }),
      })
      setResult(res)
      setMessage('Thumbnail generated successfully!')
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateVariants = async () => {
    if (!title || !niche || !videoId) return
    setGenerating(true)
    setMessage('')
    setResult(null)
    try {
      const res = await fetchAPI('/thumbnail/variants', {
        method: 'POST',
        body: JSON.stringify({ title, niche, video_id: videoId, count: 3 }),
      })
      setResult(res)
      setMessage(`Generated ${res.count} thumbnail variants!`)
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thumbnail Generator</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Generate eye-catching thumbnails for your videos</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate Thumbnail</h3>

          {/* Select video (optional) */}
          {videos.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">From Video (optional)</label>
              <select
                value={videoId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  setVideoId(id || null)
                  const v = videos.find(v => v.id === id)
                  if (v) {
                    setTitle(v.title || v.keyword)
                    setNiche(v.niche || '')
                  }
                }}
                className="select-field"
              >
                <option value="">Custom (manual input)</option>
                {videos.map((v) => (
                  <option key={v.id} value={v.id}>{v.title || v.keyword}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title / Text</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Text to display on thumbnail..."
              className="input-field"
            />
          </div>

          {/* Niche */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Niche (determines color scheme)</label>
            <div className="grid grid-cols-3 gap-2">
              {niches.map((n) => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${niche === n ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleGenerate}
              disabled={generating || !title || !niche}
              className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${generating || !title || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'}`}
            >
              {generating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              )}
              Generate Thumbnail
            </button>

            {videoId && (
              <button
                onClick={handleGenerateVariants}
                disabled={generating || !title || !niche}
                className="w-full py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Generate 3 Variants (A/B Testing)
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview</h3>
          
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
            {result ? (
              <div className="text-center text-white p-6">
                <svg className="w-12 h-12 mx-auto text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                <p className="font-bold">Thumbnail Generated!</p>
                <p className="text-sm text-gray-400 mt-2">Saved to output folder</p>
                {result.thumbnails && (
                  <p className="text-sm text-purple-400 mt-1">{result.count} variants created</p>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p className="text-sm">Thumbnail preview will appear here</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">Thumbnail Tips</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Keep text short and bold (3-5 words max)</li>
              <li>• Use high contrast colors</li>
              <li>• Faces and emotions increase CTR</li>
              <li>• Resolution: 1280x720 (16:9)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

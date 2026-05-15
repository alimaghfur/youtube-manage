'use client'

import { useState } from 'react'
import { fetchAPI } from '@/lib/api'

export default function TrendingPage() {
  const [niche, setNiche] = useState('')
  const [language, setLanguage] = useState('id')
  const [keywords, setKeywords] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'keywords' | 'topics'>('keywords')

  const niches = ['Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan', 'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga']

  const searchKeywords = async () => {
    if (!niche) return
    setLoading(true)
    try {
      const res = await fetchAPI(`/trending/keywords?niche=${encodeURIComponent(niche)}&language=${language}&count=20`)
      setKeywords(res.keywords || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const searchTopics = async () => {
    if (!niche) return
    setLoading(true)
    try {
      const res = await fetchAPI(`/trending/topics?niche=${encodeURIComponent(niche)}&language=${language}&count=10`)
      setTopics(res.topics || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (activeTab === 'keywords') searchKeywords()
    else searchTopics()
  }

  const volumeColors: Record<string, string> = {
    high: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Topics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Discover trending keywords and video ideas for your niche</p>
      </div>

      {/* Search Controls */}
      <div className="card p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Niche</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {niches.map((n) => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${niche === n ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select-field">
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('keywords')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'keywords' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            YouTube Keywords
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'topics' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            AI Topic Ideas
          </button>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !niche}
          className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${loading || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'}`}
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          )}
          {loading ? 'Searching...' : 'Find Trending Topics'}
        </button>
      </div>

      {/* Results: Keywords */}
      {activeTab === 'keywords' && keywords.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Trending Keywords ({keywords.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keywords.map((kw, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{kw.keyword}</span>
                </div>
                <a
                  href={`/generate?keyword=${encodeURIComponent(kw.keyword)}&niche=${encodeURIComponent(niche)}`}
                  className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Use
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results: Topics */}
      {activeTab === 'topics' && topics.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">AI-Suggested Topics ({topics.length})</h3>
          <div className="space-y-4">
            {topics.map((topic, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{topic.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{topic.description}</p>
                    {topic.keywords && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {topic.keywords.map((kw: string, j: number) => (
                          <span key={j} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end ml-4">
                    {topic.search_volume && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${volumeColors[topic.search_volume] || volumeColors.medium}`}>
                        {topic.search_volume} vol
                      </span>
                    )}
                    <a
                      href={`/generate?keyword=${encodeURIComponent(topic.title)}&niche=${encodeURIComponent(niche)}`}
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline mt-1"
                    >
                      Generate Video
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && keywords.length === 0 && topics.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          <p className="text-gray-500 dark:text-gray-400">Select a niche and search to find trending topics</p>
        </div>
      )}
    </div>
  )
}

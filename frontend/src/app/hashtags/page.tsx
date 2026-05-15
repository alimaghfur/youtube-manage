'use client'

import { useState } from 'react'
import { fetchAPI } from '@/lib/api'

export default function HashtagsPage() {
  const [keyword, setKeyword] = useState('')
  const [niche, setNiche] = useState('')
  const [language, setLanguage] = useState('id')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  const niches = ['Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan', 'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga']

  const handleGenerate = async () => {
    if (!keyword || !niche) return
    setLoading(true)
    try {
      const res = await fetchAPI('/hashtags/generate', {
        method: 'POST',
        body: JSON.stringify({ keyword, niche, language, count: 30 }),
      })
      setResult(res)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const allHashtags = result ? [...(result.primary || []), ...(result.secondary || []), ...(result.trending || []), ...(result.niche_specific || []), ...(result.long_tail || [])] : []

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hashtag Generator</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Generate viral hashtags optimized for YouTube reach</p>
      </div>

      {/* Input */}
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Keyword / Topic</label>
            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. fakta unik luar angkasa" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select-field">
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Niche</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {niches.map((n) => (
              <button key={n} onClick={() => setNiche(n)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${niche === n ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{n}</button>
            ))}
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !keyword || !niche} className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${loading || !keyword || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg'}`}>
          {loading ? 'Generating...' : '# Generate Hashtags'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Copy All */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">All Hashtags ({allHashtags.length})</h3>
              <button onClick={() => copyToClipboard(allHashtags.join(' '), 'all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${copied === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                {copied === 'all' ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 break-words">
              {allHashtags.join(' ')}
            </div>
          </div>

          {/* Best Combination */}
          {result.best_combination && (
            <div className="card p-5 border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary-700 dark:text-primary-400 text-sm">Best Combination (for title)</p>
                  <p className="text-primary-600 dark:text-primary-300 mt-1">{result.best_combination}</p>
                </div>
                <button onClick={() => copyToClipboard(result.best_combination, 'best')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${copied === 'best' ? 'bg-green-500 text-white' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'}`}>
                  {copied === 'best' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'primary', label: 'Primary (High Volume)', color: 'red' },
              { key: 'secondary', label: 'Secondary', color: 'blue' },
              { key: 'trending', label: 'Trending', color: 'orange' },
              { key: 'niche_specific', label: 'Niche Specific', color: 'purple' },
              { key: 'long_tail', label: 'Long Tail (Low Competition)', color: 'green' },
            ].map(({ key, label, color }) => (
              result[key] && result[key].length > 0 && (
                <div key={key} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                    <button onClick={() => copyToClipboard(result[key].join(' '), key)} className="text-xs text-primary-600 hover:underline">
                      {copied === key ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result[key].map((tag: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Tips */}
          {result.tips && result.tips.length > 0 && (
            <div className="card p-5">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Hashtag Strategy Tips</h4>
              <ul className="space-y-2">
                {result.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-yellow-500 mt-0.5">💡</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

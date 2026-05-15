'use client'

import { useState } from 'react'
import { fetchAPI } from '@/lib/api'

export default function GrowthPage() {
  const [niche, setNiche] = useState('')
  const [language, setLanguage] = useState('id')
  const [videosPerWeek, setVideosPerWeek] = useState(5)
  const [currentSubs, setCurrentSubs] = useState(0)
  const [months, setMonths] = useState(6)
  const [prediction, setPrediction] = useState<any>(null)
  const [audience, setAudience] = useState<any>(null)
  const [abResults, setAbResults] = useState<any[]>([])
  const [abTitles, setAbTitles] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'predict' | 'audience' | 'ab'>('predict')

  const niches = ['Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan', 'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga']

  const handlePredict = async () => {
    if (!niche) return
    setLoading(true)
    try {
      const res = await fetchAPI('/growth/predict', { method: 'POST', body: JSON.stringify({ niche, videos_per_week: videosPerWeek, current_subs: currentSubs, months }) })
      setPrediction(res)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleAudience = async () => {
    if (!niche) return
    setLoading(true)
    try {
      const res = await fetchAPI('/growth/audience', { method: 'POST', body: JSON.stringify({ niche, language }) })
      setAudience(res)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleABTest = async () => {
    const titles = abTitles.split('\n').filter(t => t.trim())
    if (!titles.length || !niche) return
    setLoading(true)
    try {
      const res = await fetchAPI('/growth/ab-test', { method: 'POST', body: JSON.stringify({ titles, niche, language }) })
      setAbResults(res.results || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Growth & Insights</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Predict growth, understand audience, and A/B test titles</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{id: 'predict', label: 'Growth Predictor'}, {id: 'audience', label: 'Audience Insights'}, {id: 'ab', label: 'A/B Title Test'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{t.label}</button>
        ))}
      </div>

      {/* Growth Predictor */}
      {activeTab === 'predict' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Niche</label>
                <select value={niche} onChange={(e) => setNiche(e.target.value)} className="select-field text-sm"><option value="">Select</option>{niches.map(n => <option key={n} value={n}>{n}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Videos/Week</label>
                <input type="number" value={videosPerWeek} onChange={(e) => setVideosPerWeek(Number(e.target.value))} className="input-field text-sm" min={1} max={14} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Current Subs</label>
                <input type="number" value={currentSubs} onChange={(e) => setCurrentSubs(Number(e.target.value))} className="input-field text-sm" min={0} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Months</label>
                <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="select-field text-sm"><option value={3}>3</option><option value={6}>6</option><option value={12}>12</option></select>
              </div>
              <div className="flex items-end">
                <button onClick={handlePredict} disabled={loading || !niche} className={`w-full py-2.5 rounded-lg font-medium text-sm ${loading || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'}`}>{loading ? '...' : 'Predict'}</button>
              </div>
            </div>
          </div>

          {prediction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5 text-center"><p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{prediction.monthly_predictions?.[prediction.monthly_predictions.length - 1]?.estimated_subs?.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">Predicted Subs ({months}mo)</p></div>
                <div className="card p-5 text-center"><p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{prediction.monthly_predictions?.[prediction.monthly_predictions.length - 1]?.estimated_views?.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">Monthly Views</p></div>
                <div className="card p-5 text-center"><p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${prediction.monthly_predictions?.[prediction.monthly_predictions.length - 1]?.estimated_revenue_usd}</p><p className="text-xs text-gray-500 mt-1">Monthly Revenue</p></div>
              </div>
              {prediction.milestones && (
                <div className="card p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Milestones</h4>
                  <div className="space-y-2">{prediction.milestones.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"><span className="text-sm font-bold text-primary-600">{m.subs?.toLocaleString()} subs</span><span className="text-xs text-gray-500">~{m.estimated_months} months</span><span className="text-xs text-gray-400 ml-auto">{m.tip}</span></div>
                  ))}</div>
                </div>
              )}
              {prediction.recommendations && (
                <div className="card p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Recommendations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{prediction.recommendations.map((r: string, i: number) => <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><span className="text-green-500">✓</span>{r}</div>)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audience Insights */}
      {activeTab === 'audience' && (
        <div className="space-y-6">
          <div className="card p-6 flex gap-4 items-end">
            <div className="flex-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Niche</label><select value={niche} onChange={(e) => setNiche(e.target.value)} className="select-field"><option value="">Select</option>{niches.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <button onClick={handleAudience} disabled={loading || !niche} className={`px-6 py-2.5 rounded-lg font-medium text-sm ${loading || !niche ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'}`}>{loading ? '...' : 'Get Insights'}</button>
          </div>
          {audience && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {audience.demographics && (
                <div className="card p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Demographics</h4>
                  <div className="space-y-2">{audience.demographics.age_groups?.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-3"><span className="text-xs text-gray-500 w-12">{a.range}</span><div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{width: `${a.percentage}%`}}/></div><span className="text-xs font-medium text-gray-700 dark:text-gray-300">{a.percentage}%</span></div>
                  ))}</div>
                </div>
              )}
              {audience.behavior && (
                <div className="card p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Behavior</h4>
                  <div className="space-y-3">
                    <div><p className="text-xs text-gray-500">Peak Hours</p><p className="text-sm font-medium text-gray-900 dark:text-white">{audience.behavior.peak_hours?.join(', ')}</p></div>
                    <div><p className="text-xs text-gray-500">Avg Watch Time</p><p className="text-sm font-medium text-gray-900 dark:text-white">{audience.behavior.avg_watch_time}</p></div>
                    <div><p className="text-xs text-gray-500">Preferred Length</p><p className="text-sm font-medium text-gray-900 dark:text-white">{audience.behavior.preferred_video_length}</p></div>
                  </div>
                </div>
              )}
              {audience.content_preferences && (
                <div className="card p-5 sm:col-span-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Content Preferences</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-gray-500 mb-2">Engaging Formats</p><div className="flex flex-wrap gap-1">{audience.content_preferences.most_engaging_formats?.map((f: string, i: number) => <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">{f}</span>)}</div></div>
                    <div><p className="text-xs text-gray-500 mb-2">Topics in Demand</p><div className="flex flex-wrap gap-1">{audience.content_preferences.topics_in_demand?.map((t: string, i: number) => <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">{t}</span>)}</div></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* A/B Title Test */}
      {activeTab === 'ab' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Titles to test (one per line)</label><textarea value={abTitles} onChange={(e) => setAbTitles(e.target.value)} rows={4} className="input-field resize-none" placeholder={"5 Fakta Mengejutkan Tentang Mars\nRahasia Mars Yang Jarang Diketahui\nMars: Planet Merah Yang Penuh Misteri"}/></div>
              <div className="space-y-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Niche</label><select value={niche} onChange={(e) => setNiche(e.target.value)} className="select-field"><option value="">Select</option>{niches.map(n => <option key={n} value={n}>{n}</option>)}</select>
                <button onClick={handleABTest} disabled={loading || !abTitles.trim() || !niche} className={`w-full py-2.5 rounded-lg font-medium text-sm mt-2 ${loading || !abTitles.trim() || !niche ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'}`}>{loading ? '...' : 'Test Titles'}</button>
              </div>
            </div>
          </div>
          {abResults.length > 0 && (
            <div className="card p-6">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Results (Best to Worst)</h4>
              <div className="space-y-3">{abResults.map((r: any, i: number) => (
                <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3"><span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{i + 1}</span><p className="font-medium text-gray-900 dark:text-white text-sm">{r.title}</p></div>
                    <div className="flex items-center gap-2"><div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{width: `${r.score}%`}}/></div><span className="text-sm font-bold text-gray-900 dark:text-white">{r.score}</span></div>
                  </div>
                  {r.reason && <p className="text-xs text-gray-500 dark:text-gray-400 ml-11">{r.reason}</p>}
                  {r.improvement && <p className="text-xs text-primary-600 dark:text-primary-400 ml-11 mt-1">Tip: {r.improvement}</p>}
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

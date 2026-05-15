'use client'

import { useState } from 'react'
import { fetchAPI } from '@/lib/api'

export default function PlannerPage() {
  const [niche, setNiche] = useState('')
  const [language, setLanguage] = useState('id')
  const [days, setDays] = useState(30)
  const [videosPerWeek, setVideosPerWeek] = useState(5)
  const [plan, setPlan] = useState<any>(null)
  const [competitor, setCompetitor] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'plan' | 'competitor'>('plan')
  const [competitorUrls, setCompetitorUrls] = useState('')

  const niches = ['Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan', 'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga']

  const handleGeneratePlan = async () => {
    if (!niche) return
    setLoading(true)
    try {
      const res = await fetchAPI('/planner/generate', {
        method: 'POST',
        body: JSON.stringify({ niche, language, days, videos_per_week: videosPerWeek, style: 'mixed' }),
      })
      setPlan(res)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleCompetitorAnalysis = async () => {
    if (!niche) return
    setLoading(true)
    try {
      const urls = competitorUrls.split('\n').filter(u => u.trim())
      const res = await fetchAPI('/planner/competitor-analysis', {
        method: 'POST',
        body: JSON.stringify({ niche, channel_urls: urls, language }),
      })
      setCompetitor(res)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Content Planner</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Plan your content strategy with AI intelligence</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('plan')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'plan' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
          Content Plan
        </button>
        <button onClick={() => setActiveTab('competitor')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'competitor' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
          Competitor Analysis
        </button>
      </div>

      {/* Content Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Niche</label>
                <select value={niche} onChange={(e) => setNiche(e.target.value)} className="select-field">
                  <option value="">Select</option>
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="select-field">
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                  <option value={30}>1 Month</option>
                  <option value={60}>2 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Videos/Week</label>
                <select value={videosPerWeek} onChange={(e) => setVideosPerWeek(Number(e.target.value))} className="select-field">
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleGeneratePlan} disabled={loading || !niche} className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${loading || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'}`}>
                  {loading ? 'Generating...' : 'Generate Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* Plan Results */}
          {plan && (
            <div className="space-y-6">
              {/* Strategy Notes */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{plan.plan_name || 'Content Plan'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                    <p className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm mb-2">Strategy</p>
                    <ul className="space-y-1">{(plan.strategy_notes || []).map((n: string, i: number) => <li key={i} className="text-xs text-indigo-600 dark:text-indigo-400">• {n}</li>)}</ul>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="font-semibold text-green-700 dark:text-green-400 text-sm mb-2">Best Upload Times</p>
                    <div className="flex gap-2 flex-wrap">{(plan.best_upload_times || []).map((t: string, i: number) => <span key={i} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-1 rounded">{t}</span>)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm mb-2">Growth Tips</p>
                    <ul className="space-y-1">{(plan.growth_tips || []).map((t: string, i: number) => <li key={i} className="text-xs text-orange-600 dark:text-orange-400">• {t}</li>)}</ul>
                  </div>
                </div>
              </div>

              {/* Video List */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Planned Videos ({plan.total_videos || plan.videos?.length})</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {(plan.videos || []).map((v: any, i: number) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">Day {v.day_offset}</span>
                            <span className="text-xs text-gray-400">{v.scheduled_date}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-2">{v.title}</h4>
                          {v.topic && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{v.topic}</p>}
                          {v.hook && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">Hook: "{v.hook}"</p>}
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{v.video_type}</span>
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{v.duration}</span>
                            {(v.tags || []).slice(0, 3).map((t: string, j: number) => <span key={j} className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">#{t}</span>)}
                          </div>
                        </div>
                        <a href={`/generate?keyword=${encodeURIComponent(v.title)}&niche=${encodeURIComponent(niche)}`} className="btn-secondary text-xs px-3 py-1.5 ml-3">Generate</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Competitor Analysis Tab */}
      {activeTab === 'competitor' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Niche</label>
                <select value={niche} onChange={(e) => setNiche(e.target.value)} className="select-field">
                  <option value="">Select</option>
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Competitor Channel URLs (optional)</label>
                <textarea value={competitorUrls} onChange={(e) => setCompetitorUrls(e.target.value)} placeholder="One URL per line..." rows={2} className="input-field resize-none" />
              </div>
            </div>
            <button onClick={handleCompetitorAnalysis} disabled={loading || !niche} className={`w-full py-3 rounded-lg font-bold transition-all ${loading || !niche ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg'}`}>
              {loading ? 'Analyzing...' : 'Analyze Competitors'}
            </button>
          </div>

          {/* Results */}
          {competitor && !competitor.error && (
            <div className="space-y-4">
              {competitor.niche_overview && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Niche Overview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{competitor.niche_overview}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {competitor.content_gaps && (
                  <div className="card p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Content Gaps (Opportunities)</h4>
                    <ul className="space-y-2">{competitor.content_gaps.map((g: string, i: number) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2"><span className="text-green-500">✓</span>{g}</li>)}</ul>
                  </div>
                )}
                {competitor.growth_strategies && (
                  <div className="card p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Growth Strategies</h4>
                    <ul className="space-y-2">{competitor.growth_strategies.map((s: string, i: number) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2"><span className="text-blue-500">→</span>{s}</li>)}</ul>
                  </div>
                )}
                {competitor.keywords_to_target && (
                  <div className="card p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Keywords to Target</h4>
                    <div className="flex flex-wrap gap-2">{competitor.keywords_to_target.map((k: string, i: number) => <span key={i} className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full">{k}</span>)}</div>
                  </div>
                )}
                {competitor.differentiation_ideas && (
                  <div className="card p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">How to Stand Out</h4>
                    <ul className="space-y-2">{competitor.differentiation_ideas.map((d: string, i: number) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2"><span className="text-purple-500">★</span>{d}</li>)}</ul>
                  </div>
                )}
              </div>
              {competitor.avoid && (
                <div className="card p-5 border-red-200 dark:border-red-800">
                  <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-3">Things to Avoid</h4>
                  <ul className="space-y-1">{competitor.avoid.map((a: string, i: number) => <li key={i} className="text-xs text-red-600 dark:text-red-400">✗ {a}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

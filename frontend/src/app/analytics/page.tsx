'use client'

import { useState, useEffect } from 'react'
import { fetchAPI } from '@/lib/api'

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [byNiche, setByNiche] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [o, r, n] = await Promise.all([
        fetchAPI('/analytics/overview'),
        fetchAPI('/analytics/revenue'),
        fetchAPI('/analytics/by-niche'),
      ])
      setOverview(o)
      setRevenue(r)
      setByNiche(n.niches || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Revenue</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track performance and estimated earnings</p>
      </div>

      {/* Stats Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total', value: overview.overview.total_videos, color: 'blue' },
            { label: 'Uploaded', value: overview.overview.uploaded, color: 'green' },
            { label: 'Ready', value: overview.overview.ready, color: 'yellow' },
            { label: 'Generating', value: overview.overview.generating, color: 'purple' },
            { label: 'Failed', value: overview.overview.failed, color: 'red' },
            { label: 'Success %', value: `${overview.overview.success_rate}%`, color: 'emerald' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Estimation */}
      {revenue && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Estimate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">Total Estimated Revenue</p>
              <p className="text-3xl font-bold text-green-800 dark:text-green-300 mt-2">
                ${revenue.estimated_revenue.total_low} - ${revenue.estimated_revenue.total_high}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">Based on {revenue.uploaded_videos} uploaded videos</p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Monthly Projection</p>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-2">
                ${revenue.estimated_revenue.monthly_low} - ${revenue.estimated_revenue.monthly_high}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">{revenue.monthly_uploads} uploads this month</p>
            </div>
          </div>
          {revenue.tips && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tips to Increase Revenue</p>
              <ul className="space-y-1">
                {revenue.tips.map((tip: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Niche */}
        {byNiche.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance by Niche</h3>
            <div className="space-y-3">
              {byNiche.map((n) => (
                <div key={n.niche} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{n.niche}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">{n.total} total</span>
                    <span className="text-green-600">{n.uploaded} uploaded</span>
                    {n.failed > 0 && <span className="text-red-500">{n.failed} failed</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Production */}
        {overview && overview.weekly && (
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Production</h3>
            <div className="space-y-3">
              {overview.weekly.map((w: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-16">{w.week}</span>
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg flex items-center px-3"
                      style={{ width: `${Math.min(100, (w.videos / Math.max(...overview.weekly.map((x: any) => x.videos), 1)) * 100)}%` }}
                    >
                      <span className="text-xs text-white font-bold">{w.videos}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Type */}
        {overview && overview.by_type && overview.by_type.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Video Types</h3>
            <div className="grid grid-cols-3 gap-3">
              {overview.by_type.map((t: any) => (
                <div key={t.type} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{t.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{t.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { fetchAPI } from '@/lib/api'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('')
  const [videoType, setVideoType] = useState('slideshow')
  const [language, setLanguage] = useState('id')
  const [voice, setVoice] = useState('edge-tts')
  const [duration, setDuration] = useState('medium')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const niches = ['Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan', 'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga']

  useEffect(() => { loadTemplates() }, [])

  const loadTemplates = async () => {
    try {
      const res = await fetchAPI('/templates/')
      setTemplates(res.templates || [])
    } catch (e) { } finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!name) return
    try {
      await fetchAPI('/templates/', {
        method: 'POST',
        body: JSON.stringify({ name, niche, video_type: videoType, language, voice_engine: voice, duration_target: duration, description }),
      })
      setMessage('Template saved!')
      setShowForm(false)
      setName(''); setDescription('')
      loadTemplates()
    } catch (e: any) { setMessage(`Error: ${e.message}`) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this template?')) return
    try {
      await fetchAPI(`/templates/${id}`, { method: 'DELETE' })
      loadTemplates()
    } catch (e) { }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Save reusable video generation presets</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          New Template
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
          {message}
        </div>
      )}

      {/* New Template Form */}
      {showForm && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Niche</label>
              <select value={niche} onChange={(e) => setNiche(e.target.value)} className="select-field">
                <option value="">Any</option>
                {niches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Video Type</label>
              <select value={videoType} onChange={(e) => setVideoType(e.target.value)} className="select-field">
                <option value="slideshow">Slideshow + Narasi</option>
                <option value="text-screen">Text on Screen</option>
                <option value="listicle">Fakta/Listicle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="select-field">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this template is for..." className="input-field" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary">Save Template</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card-hover p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</h4>
                <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
              {t.description && <p className="text-xs text-gray-500 dark:text-gray-400">{t.description}</p>}
              <div className="flex flex-wrap gap-1">
                {t.niche && <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded">{t.niche}</span>}
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{t.video_type}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{t.duration_target}</span>
              </div>
              <a href={`/generate?niche=${encodeURIComponent(t.niche || '')}&type=${t.video_type}&duration=${t.duration_target}`} className="block w-full text-center py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                Use Template
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p className="text-gray-500 dark:text-gray-400">No templates yet. Create your first one!</p>
        </div>
      )}
    </div>
  )
}

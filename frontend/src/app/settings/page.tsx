'use client'

import { useState, useEffect } from 'react'
import { getSettings, updateSettingsBulk, getApiHealth } from '@/lib/api'

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('')
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [leonardoKey, setLeonardoKey] = useState('')
  const [youtubeKey, setYoutubeKey] = useState('')
  const [youtubeClientId, setYoutubeClientId] = useState('')
  const [youtubeClientSecret, setYoutubeClientSecret] = useState('')
  const [defaultNiche, setDefaultNiche] = useState('')
  const [defaultLanguage, setDefaultLanguage] = useState('id')
  const [humanizePreset, setHumanizePreset] = useState('natural')
  const [complianceEnabled, setComplianceEnabled] = useState('true')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [health, setHealth] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const [settings, h] = await Promise.all([getSettings(), getApiHealth()])
      setGeminiKey(settings.gemini_api_key || '')
      setElevenLabsKey(settings.elevenlabs_api_key || '')
      setLeonardoKey(settings.leonardo_api_key || '')
      setYoutubeKey(settings.youtube_api_key || '')
      setYoutubeClientId(settings.youtube_client_id || '')
      setYoutubeClientSecret(settings.youtube_client_secret || '')
      setDefaultNiche(settings.default_niche || '')
      setDefaultLanguage(settings.default_language || 'id')
      setHumanizePreset(settings.humanize_preset || 'natural')
      setComplianceEnabled(settings.compliance_enabled || 'true')
      setHealth(h)
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const settings: Record<string, string> = {
        gemini_api_key: geminiKey,
        elevenlabs_api_key: elevenLabsKey,
        leonardo_api_key: leonardoKey,
        youtube_api_key: youtubeKey,
        youtube_client_id: youtubeClientId,
        youtube_client_secret: youtubeClientSecret,
        default_niche: defaultNiche,
        default_language: defaultLanguage,
        humanize_preset: humanizePreset,
        compliance_enabled: complianceEnabled,
      }
      await updateSettingsBulk(settings)
      setMessage('Settings saved successfully!')
      // Refresh health
      const h = await getApiHealth()
      setHealth(h)
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const apiCards = [
    {
      name: 'Google Gemini',
      description: 'AI text generation for scripts & narration',
      key: geminiKey,
      setKey: setGeminiKey,
      icon: '🧠',
      healthKey: 'gemini',
      link: 'https://aistudio.google.com/apikey',
      linkLabel: 'Get API Key',
    },
    {
      name: 'ElevenLabs',
      description: 'Pro-quality text-to-speech voices',
      key: elevenLabsKey,
      setKey: setElevenLabsKey,
      icon: '🎙️',
      healthKey: 'elevenlabs',
      link: 'https://elevenlabs.io/app/settings/api-keys',
      linkLabel: 'Get API Key',
    },
    {
      name: 'Leonardo AI',
      description: 'AI image generation for video visuals',
      key: leonardoKey,
      setKey: setLeonardoKey,
      icon: '🎨',
      healthKey: 'leonardo',
      link: 'https://app.leonardo.ai/api-access',
      linkLabel: 'Get API Key',
    },
    {
      name: 'YouTube API Key',
      description: 'Upload & manage videos on YouTube',
      key: youtubeKey,
      setKey: setYoutubeKey,
      icon: '📺',
      healthKey: 'youtube',
      link: 'https://console.cloud.google.com/apis/credentials',
      linkLabel: 'Google Cloud Console',
    },
  ]

  const statusColors: Record<string, string> = {
    connected: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    'not configured': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your API keys and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
          {message}
        </div>
      )}

      {/* API Keys Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">API Keys</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apiCards.map((api) => (
            <div key={api.name} className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{api.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{api.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{api.description}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[health[api.healthKey] || 'not configured']}`}>
                  {health[api.healthKey] || 'not configured'}
                </span>
              </div>
              <input
                type="password"
                value={api.key}
                onChange={(e) => api.setKey(e.target.value)}
                placeholder="Enter API key..."
                className="input-field text-sm"
              />
              <a
                href={api.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                {api.linkLabel}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube OAuth */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">YouTube OAuth Credentials</h2>
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            Google Cloud Console
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Client ID</label>
            <input
              type="password"
              value={youtubeClientId}
              onChange={(e) => setYoutubeClientId(e.target.value)}
              placeholder="YouTube Client ID..."
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Client Secret</label>
            <input
              type="password"
              value={youtubeClientSecret}
              onChange={(e) => setYoutubeClientSecret(e.target.value)}
              placeholder="YouTube Client Secret..."
              className="input-field text-sm"
            />
          </div>
        </div>
      </div>

      {/* Default Preferences */}
      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Default Preferences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Default Niche
            </label>
            <select value={defaultNiche} onChange={(e) => setDefaultNiche(e.target.value)} className="select-field">
              <option value="">No default</option>
              <option value="Fakta Unik">Fakta Unik</option>
              <option value="Edukasi">Edukasi</option>
              <option value="Teknologi">Teknologi</option>
              <option value="Motivasi">Motivasi</option>
              <option value="Sains">Sains</option>
              <option value="Sejarah">Sejarah</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Default Language
            </label>
            <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className="select-field">
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Humanization & YouTube Compliance */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Humanization & YouTube Compliance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Make videos appear natural and follow YouTube guidelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Humanization Preset */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Humanization Level
            </label>
            <select value={humanizePreset} onChange={(e) => setHumanizePreset(e.target.value)} className="select-field">
              <option value="natural">Natural (Recommended)</option>
              <option value="subtle">Subtle (Minimal processing)</option>
              <option value="heavy">Heavy (Maximum humanization)</option>
              <option value="none">None (Raw AI output)</option>
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {humanizePreset === 'natural' && 'Balanced - adds voice variation, ambient noise, pauses, and visual effects'}
              {humanizePreset === 'subtle' && 'Minimal - keeps AI quality but adds slight speed variation and pauses'}
              {humanizePreset === 'heavy' && 'Maximum - sounds most like a real recording with cafe ambience'}
              {humanizePreset === 'none' && 'No processing applied - raw AI-generated output'}
            </p>
          </div>

          {/* YouTube Compliance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              YouTube Compliance
            </label>
            <select value={complianceEnabled} onChange={(e) => setComplianceEnabled(e.target.value)} className="select-field">
              <option value="true">Enabled (Recommended)</option>
              <option value="false">Disabled</option>
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {complianceEnabled === 'true' ? 'Auto-adds AI disclosure, engagement hooks, timestamps, and content variation' : 'No compliance features applied - manage manually'}
            </p>
          </div>
        </div>

        {/* What humanization does */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border border-green-200 dark:border-green-800">
          <p className="font-semibold text-green-800 dark:text-green-300 text-sm mb-3">What this does to your videos:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">Voice speed variation (not robotic)</span></div>
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">Natural breathing pauses between scenes</span></div>
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">Subtle ambient room noise</span></div>
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">Ken Burns effect on images (subtle zoom/pan)</span></div>
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">Color temperature variation (like real camera)</span></div>
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">AI disclosure auto-added (YouTube required)</span></div>
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">Engagement hooks (subscribe, like CTAs)</span></div>
            <div className="flex items-start gap-2"><span className="text-green-500 text-sm">✓</span><span className="text-xs text-green-700 dark:text-green-400">Unique content variation (no repetitive patterns)</span></div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
          {saving ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

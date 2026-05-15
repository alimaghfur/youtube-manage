'use client'

import { useState } from 'react'

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('')
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [leonardoKey, setLeonardoKey] = useState('')
  const [youtubeKey, setYoutubeKey] = useState('')
  const [defaultNiche, setDefaultNiche] = useState('')
  const [defaultLanguage, setDefaultLanguage] = useState('id')

  const apiCards = [
    {
      name: 'Google Gemini',
      description: 'AI text generation for scripts & narration',
      key: geminiKey,
      setKey: setGeminiKey,
      color: 'blue',
      icon: '🧠',
      status: geminiKey ? 'connected' : 'not configured',
    },
    {
      name: 'ElevenLabs',
      description: 'Pro-quality text-to-speech voices',
      key: elevenLabsKey,
      setKey: setElevenLabsKey,
      color: 'purple',
      icon: '🎙️',
      status: elevenLabsKey ? 'connected' : 'not configured',
    },
    {
      name: 'Leonardo AI',
      description: 'AI image generation for video visuals',
      key: leonardoKey,
      setKey: setLeonardoKey,
      color: 'orange',
      icon: '🎨',
      status: leonardoKey ? 'connected' : 'not configured',
    },
    {
      name: 'YouTube Data API',
      description: 'Upload & manage videos on YouTube',
      key: youtubeKey,
      setKey: setYoutubeKey,
      color: 'red',
      icon: '📺',
      status: youtubeKey ? 'connected' : 'not configured',
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
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[api.status]}`}>
                  {api.status}
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={api.key}
                  onChange={(e) => api.setKey(e.target.value)}
                  placeholder="Enter API key..."
                  className="input-field pr-10 text-sm"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
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
            <select
              value={defaultNiche}
              onChange={(e) => setDefaultNiche(e.target.value)}
              className="select-field"
            >
              <option value="">No default</option>
              <option value="fakta">Fakta Unik</option>
              <option value="edukasi">Edukasi</option>
              <option value="teknologi">Teknologi</option>
              <option value="motivasi">Motivasi</option>
              <option value="sains">Sains</option>
              <option value="sejarah">Sejarah</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Default Language
            </label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="select-field"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* YouTube Channel Info */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">YouTube Channel</h2>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
              <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Not Connected</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect your YouTube channel to enable uploads</p>
          </div>
          <button className="ml-auto btn-primary text-sm">
            Connect
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary px-8">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Settings
        </button>
      </div>
    </div>
  )
}

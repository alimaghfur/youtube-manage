'use client'

import { useState } from 'react'

export default function GenerateVideo() {
  const [keyword, setKeyword] = useState('')
  const [niche, setNiche] = useState('')
  const [videoType, setVideoType] = useState('')
  const [language, setLanguage] = useState('id')
  const [voice, setVoice] = useState('edge-tts')
  const [duration, setDuration] = useState('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  const niches = [
    'Fakta Unik', 'Edukasi', 'Teknologi', 'Motivasi', 'Kesehatan',
    'Sejarah', 'Sains', 'Bisnis', 'Gaming', 'Kuliner', 'Travel', 'Olahraga',
  ]

  const videoTypes = [
    { id: 'slideshow', name: 'Slideshow + Narasi', icon: '🖼️', desc: 'Gambar AI berganti + suara narasi' },
    { id: 'text-screen', name: 'Text on Screen + Musik', icon: '📝', desc: 'Teks animasi + background music' },
    { id: 'listicle', name: 'Fakta / Listicle', icon: '🎬', desc: 'Gambar + teks + narasi bergantian' },
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    setProgress(0)
    setCurrentStep('Generating script...')
    // Simulation of progress
    const steps = [
      { step: 'Generating script...', progress: 20 },
      { step: 'Creating audio narration...', progress: 40 },
      { step: 'Generating images...', progress: 60 },
      { step: 'Composing video...', progress: 80 },
      { step: 'Finalizing...', progress: 100 },
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < steps.length) {
        setCurrentStep(steps[i].step)
        setProgress(steps[i].progress)
        i++
      } else {
        clearInterval(interval)
        setIsGenerating(false)
        setCurrentStep('')
      }
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Video</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Create AI-powered video content automatically</p>
      </div>

      {/* Form */}
      <div className="card p-8 space-y-6">
        {/* Keyword */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Keyword / Topic
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. 5 fakta unik tentang luar angkasa"
            className="input-field"
          />
        </div>

        {/* Niche */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Niche
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {niches.map((n) => (
              <button
                key={n}
                onClick={() => setNiche(n)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  niche === n
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Video Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Video Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {videoTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setVideoType(type.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  videoType === type.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{type.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Language & Voice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="select-field"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Voice Engine
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="select-field"
            >
              <option value="edge-tts">Edge TTS (Free, Unlimited)</option>
              <option value="elevenlabs">ElevenLabs (Pro Quality, Limited)</option>
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Duration Target
          </label>
          <div className="flex gap-3">
            {[
              { id: 'short', label: 'Short', desc: '~1 min' },
              { id: 'medium', label: 'Medium', desc: '3-5 min' },
              { id: 'long', label: 'Long', desc: '8-10 min' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={`flex-1 py-3 px-4 rounded-lg text-center transition-all duration-200 ${
                  duration === d.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <p className="font-semibold text-sm">{d.label}</p>
                <p className={`text-xs mt-0.5 ${duration === d.id ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !keyword || !niche || !videoType}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              isGenerating || !keyword || !niche || !videoType
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Video
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentStep}</span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

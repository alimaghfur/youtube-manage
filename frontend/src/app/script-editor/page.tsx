'use client'

import { useState, useEffect } from 'react'
import { fetchAPI, getVideos } from '@/lib/api'

export default function ScriptEditorPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [script, setScript] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [musicPreset, setMusicPreset] = useState('ambient')
  const [subtitleStyle, setSubtitleStyle] = useState('default')

  useEffect(() => { loadVideos() }, [])

  const loadVideos = async () => {
    try {
      const res = await getVideos()
      setVideos(res.videos || [])
    } catch (e) {} finally { setLoading(false) }
  }

  const loadScript = async (id: number) => {
    setSelectedId(id)
    try {
      const res = await fetchAPI(`/script/${id}`)
      setScript(res)
    } catch (e: any) { setMessage(`Error: ${e.message}`) }
  }

  const handleSave = async () => {
    if (!selectedId || !script?.script) return
    setSaving(true)
    try {
      await fetchAPI(`/script/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify({ script: JSON.stringify(script.script) }),
      })
      setMessage('Script saved!')
    } catch (e: any) { setMessage(`Error: ${e.message}`) } finally { setSaving(false) }
  }

  const handleRegenScene = async (index: number) => {
    if (!selectedId) return
    try {
      const res = await fetchAPI('/script/regenerate-scene', {
        method: 'POST',
        body: JSON.stringify({ video_id: selectedId, scene_index: index }),
      })
      if (res.new_scene && script?.script?.scenes) {
        const updated = { ...script }
        updated.script.scenes[index] = res.new_scene
        setScript(updated)
        setMessage(`Scene ${index + 1} regenerated!`)
      }
    } catch (e: any) { setMessage(`Error: ${e.message}`) }
  }

  const handleAddMusic = async () => {
    if (!selectedId) return
    try {
      await fetchAPI('/music/add', { method: 'POST', body: JSON.stringify({ video_id: selectedId, preset: musicPreset, volume: 0.1 }) })
      setMessage('Background music added!')
    } catch (e: any) { setMessage(`Error: ${e.message}`) }
  }

  const handleAddSubtitles = async () => {
    if (!selectedId) return
    try {
      await fetchAPI('/subtitles/generate', { method: 'POST', body: JSON.stringify({ video_id: selectedId, style: subtitleStyle }) })
      setMessage('Subtitles generated and burned!')
    } catch (e: any) { setMessage(`Error: ${e.message}`) }
  }

  const updateScene = (index: number, field: string, value: string) => {
    if (!script?.script?.scenes) return
    const updated = { ...script }
    updated.script.scenes[index] = { ...updated.script.scenes[index], [field]: value }
    setScript(updated)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Script Editor & Video Tools</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Edit scripts, add music, generate subtitles</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video List */}
        <div className="card p-4 lg:col-span-1 max-h-[70vh] overflow-y-auto">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Videos</h3>
          {loading ? <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /> : (
            <div className="space-y-2">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => loadScript(v.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all text-xs ${selectedId === v.id ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'}`}
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">{v.title || v.keyword}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">{v.niche} • {v.status}</p>
                </button>
              ))}
              {videos.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No videos yet</p>}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {script?.script ? (
            <>
              {/* Header */}
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{script.title || script.keyword}</h3>
                  <p className="text-xs text-gray-500">{script.script.scenes?.length || 0} scenes</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2">
                    {saving ? 'Saving...' : 'Save Script'}
                  </button>
                </div>
              </div>

              {/* Scenes */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {(script.script.scenes || []).map((scene: any, i: number) => (
                  <div key={i} className="card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">Scene {i + 1}</span>
                      <button onClick={() => handleRegenScene(i)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Regenerate</button>
                    </div>
                    <textarea
                      value={scene.narration || ''}
                      onChange={(e) => updateScene(i, 'narration', e.target.value)}
                      rows={3}
                      className="input-field text-sm resize-none"
                      placeholder="Scene narration..."
                    />
                    <input
                      type="text"
                      value={scene.image_prompt || ''}
                      onChange={(e) => updateScene(i, 'image_prompt', e.target.value)}
                      className="input-field text-xs"
                      placeholder="Image prompt..."
                    />
                  </div>
                ))}
              </div>

              {/* Video Tools */}
              <div className="card p-5">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Video Enhancement Tools</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Background Music */}
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 space-y-3">
                    <p className="font-semibold text-purple-700 dark:text-purple-400 text-sm">Background Music</p>
                    <select value={musicPreset} onChange={(e) => setMusicPreset(e.target.value)} className="select-field text-sm">
                      <option value="ambient">Ambient (Soft)</option>
                      <option value="upbeat">Upbeat (Energetic)</option>
                      <option value="dramatic">Dramatic (Deep)</option>
                      <option value="chill">Chill (Lo-fi)</option>
                      <option value="motivational">Motivational</option>
                    </select>
                    <button onClick={handleAddMusic} className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">Add Music</button>
                  </div>
                  {/* Subtitles */}
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 space-y-3">
                    <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm">Auto Subtitles</p>
                    <select value={subtitleStyle} onChange={(e) => setSubtitleStyle(e.target.value)} className="select-field text-sm">
                      <option value="default">Default (White)</option>
                      <option value="bold">Bold (Large)</option>
                      <option value="minimal">Minimal (Clean)</option>
                      <option value="colorful">Colorful (Cyan)</option>
                    </select>
                    <button onClick={handleAddSubtitles} className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors">Generate Subtitles</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-16 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <p className="text-gray-500 dark:text-gray-400">Select a video from the list to edit its script</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

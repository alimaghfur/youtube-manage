'use client'

import { useState, useEffect } from 'react'
import { fetchAPI } from '@/lib/api'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [type, setType] = useState('telegram')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetchAPI('/notifications/')
      setNotifications(res.notifications || [])
    } catch (e) { } finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!webhookUrl) return
    try {
      await fetchAPI('/notifications/', {
        method: 'POST',
        body: JSON.stringify({ type, webhook_url: webhookUrl, events: ['generate_complete', 'upload_complete', 'error'] }),
      })
      setMessage('Notification channel added!')
      setWebhookUrl('')
      loadNotifications()
    } catch (e: any) { setMessage(`Error: ${e.message}`) }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchAPI(`/notifications/${id}`, { method: 'DELETE' })
      loadNotifications()
    } catch (e) { }
  }

  const handleToggle = async (id: number) => {
    try {
      await fetchAPI(`/notifications/${id}/toggle`, { method: 'PUT' })
      loadNotifications()
    } catch (e) { }
  }

  const handleTest = async () => {
    if (!webhookUrl) return
    try {
      await fetchAPI('/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ type, webhook_url: webhookUrl, events: [] }),
      })
      setMessage('Test notification sent!')
    } catch (e: any) { setMessage(`Error: ${e.message}`) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Get notified when videos are generated or uploaded</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
          {message}
        </div>
      )}

      {/* Add Notification */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Notification Channel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Platform</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="select-field">
              <option value="telegram">Telegram</option>
              <option value="discord">Discord</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {type === 'telegram' ? 'Bot Token | Chat ID' : 'Webhook URL'}
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder={type === 'telegram' ? 'BOT_TOKEN|CHAT_ID' : 'https://discord.com/api/webhooks/...'}
              className="input-field"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {type === 'telegram' ? 'Format: your_bot_token|your_chat_id (separated by |)' : 'Get webhook URL from Discord channel settings > Integrations > Webhooks'}
        </p>
        <div className="flex gap-3">
          <button onClick={handleAdd} className="btn-primary">Add Channel</button>
          <button onClick={handleTest} disabled={!webhookUrl} className="btn-secondary">Send Test</button>
        </div>
      </div>

      {/* Active Notifications */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Channels</h3>
        {loading ? (
          <div className="flex items-center justify-center h-20"><div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${n.type === 'telegram' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                    <span className="text-lg">{n.type === 'telegram' ? '📱' : '💬'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm capitalize">{n.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{n.webhook_url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(n.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${n.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}
                  >
                    {n.is_active ? 'Active' : 'Paused'}
                  </button>
                  <button onClick={() => handleDelete(n.id)} className="text-red-500 hover:text-red-700 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No notification channels configured</p>
        )}
      </div>

      {/* Events Info */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notification Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Generate Complete</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">When a video finishes generating</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-700 dark:text-blue-400 text-sm">Upload Complete</p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">When a video is uploaded to YouTube</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Error</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">When something goes wrong</p>
          </div>
        </div>
      </div>
    </div>
  )
}

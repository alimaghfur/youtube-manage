'use client'

import { useState, useEffect } from 'react'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getQueue, removeFromQueue } from '@/lib/api'

export default function Scheduler() {
  const [scheduleTime, setScheduleTime] = useState('10:00')
  const [scheduleDays, setScheduleDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [schedules, setSchedules] = useState<any[]>([])
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const days = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [s, q] = await Promise.all([getSchedules(), getQueue()])
      setSchedules(s.schedules || [])
      setQueue(q.queue || [])
      if (s.schedules && s.schedules.length > 0) {
        setScheduleTime(s.schedules[0].upload_time)
        setScheduleDays(s.schedules[0].days)
      }
    } catch (e) {
      console.error('Failed to load scheduler data:', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSaveSchedule = async () => {
    setSaving(true)
    setMessage('')
    try {
      if (schedules.length > 0) {
        await updateSchedule(schedules[0].id, { upload_time: scheduleTime, days: scheduleDays })
      } else {
        await createSchedule({ upload_time: scheduleTime, days: scheduleDays })
      }
      setMessage('Schedule saved!')
      loadData()
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFromQueue = async (id: number) => {
    try {
      await removeFromQueue(id)
      loadData()
    } catch (e) {
      console.error('Failed to remove from queue:', e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scheduler</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Set automatic upload schedule for your videos</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Settings */}
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Schedule</h3>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Time</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Days</label>
            <div className="flex gap-2">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`w-11 h-11 rounded-full text-sm font-bold transition-all duration-200 ${
                    scheduleDays.includes(day.id)
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {schedules.length > 0 ? `Scheduler active — Uploads at ${scheduleTime}` : 'No schedule set'}
              </span>
            </div>
          </div>

          <button onClick={handleSaveSchedule} disabled={saving} className="btn-primary w-full justify-center">
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        {/* Queue */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Queue</h3>
            <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full">
              {queue.length} videos
            </span>
          </div>

          {queue.length > 0 ? (
            <div className="space-y-3">
              {queue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.title || `Video #${item.video_id}`}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.scheduled_date} at {item.scheduled_time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromQueue(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No videos in queue</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Generate videos first, then add to queue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

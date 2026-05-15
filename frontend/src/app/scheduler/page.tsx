'use client'

import { useState } from 'react'

export default function Scheduler() {
  const [scheduleTime, setScheduleTime] = useState('10:00')
  const [scheduleDays, setScheduleDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri'])

  const days = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' },
  ]

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const queueItems = [
    { id: 1, title: 'Sample Video 1', date: '2026-05-16', time: '10:00', status: 'queued' },
    { id: 2, title: 'Sample Video 2', date: '2026-05-17', time: '10:00', status: 'queued' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scheduler</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Set automatic upload schedule for your videos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Settings */}
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Schedule</h3>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upload Time
            </label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upload Days
            </label>
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
                Scheduler is active — Next upload: Tomorrow at {scheduleTime}
              </span>
            </div>
          </div>

          <button className="btn-primary w-full justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Schedule
          </button>
        </div>

        {/* Queue */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Queue</h3>
            <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full">
              {queueItems.length} videos
            </span>
          </div>

          {queueItems.length > 0 ? (
            <div className="space-y-3">
              {queueItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.date} at {item.time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full capitalize">
                    {item.status}
                  </span>
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
            </div>
          )}
        </div>
      </div>

      {/* Calendar View */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Calendar View</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 3 // offset for starting day
            const isToday = day === 15
            const hasVideo = [16, 17, 19, 20, 21].includes(day)
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                  day > 0 && day <= 31
                    ? isToday
                      ? 'bg-primary-600 text-white font-bold'
                      : hasVideo
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-gray-900 dark:text-gray-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    : 'text-gray-300 dark:text-gray-700'
                }`}
              >
                {day > 0 && day <= 31 && (
                  <>
                    <span>{day}</span>
                    {hasVideo && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-0.5" />}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

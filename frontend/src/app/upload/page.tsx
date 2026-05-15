'use client'

import { useState } from 'react'

export default function Upload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState('public')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload to YouTube</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your generated videos directly to YouTube</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2 card p-6 space-y-6">
          {/* Video Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Video
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Select from Library</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a video from your generated library</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="input-field"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description..."
              rows={5}
              className="input-field resize-none"
              maxLength={5000}
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/5000 characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate tags with comma (e.g. fakta, unik, sains)"
              className="input-field"
            />
          </div>

          {/* Category & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select-field"
              >
                <option value="">Select category</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="science">Science & Technology</option>
                <option value="howto">Howto & Style</option>
                <option value="people">People & Blogs</option>
                <option value="news">News & Politics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="select-field"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <div className="pt-4">
            <button className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload to YouTube
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="card p-6 h-fit space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview</h3>

          {/* Video Preview */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {title || 'Video title will appear here'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
              {description || 'Video description will appear here...'}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Visibility</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{visibility}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Category</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{category || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

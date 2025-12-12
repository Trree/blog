'use client'

import { useState } from 'react'
import { useKanbanStore } from './store'
import type { KanbanTask } from 'contentlayer/generated'

interface KanbanCardEditProps {
  task: KanbanTask
}

export const KanbanCardEdit = ({ task }: KanbanCardEditProps) => {
  const { updateTask, setEditingTask } = useKanbanStore()
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState(task.priority)
  const [tags, setTags] = useState(task.tags?.join(', ') || '')
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  )

  const handleSave = () => {
    updateTask(task.id, {
      title,
      priority: priority as any,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })
    setEditingTask(null)

    // TODO: Call API to persist
    // await fetch('/api/kanban/update', { ... })
  }

  const handleCancel = () => {
    setEditingTask(null)
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="space-y-3">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          placeholder="Task title"
          autoFocus
        />

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        {/* Tags */}
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          placeholder="Tags (comma separated)"
        />

        {/* Due Date */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 rounded bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

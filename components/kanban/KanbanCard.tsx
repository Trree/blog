'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { useKanbanStore } from './store'
import { KanbanCardEdit } from './KanbanCardEdit'
import type { KanbanTask } from 'contentlayer/generated'

interface KanbanCardProps {
  task: KanbanTask
  isDragging?: boolean
}

const PRIORITY_COLORS = {
  low: 'border-l-4 border-l-green-500',
  medium: 'border-l-4 border-l-yellow-500',
  high: 'border-l-4 border-l-red-500',
}

export const KanbanCard = ({ task, isDragging = false }: KanbanCardProps) => {
  const { editingTaskId, setEditingTask, deleteTask } = useKanbanStore()
  const [showActions, setShowActions] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const isEditing = editingTaskId === task.id

  if (isEditing) {
    return <KanbanCardEdit task={task} />
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${
        PRIORITY_COLORS[task.priority]
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Card Content */}
      <div className="mb-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-900 dark:text-primary-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div
          className={`flex items-center gap-1 text-xs ${
            task.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <CalendarIcon className="h-3 w-3" />
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setEditingTask(task.id)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
            aria-label="Edit task"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this task?')) {
                deleteTask(task.id)
              }
            }}
            className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900"
            aria-label="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

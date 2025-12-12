'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useKanbanStore } from './store'
import type { KanbanTask } from 'contentlayer/generated'
import { useParams } from 'next/navigation'
import type { LocaleTypes } from '@/app/[locale]/i18n/settings'

interface KanbanColumnProps {
  column: {
    id: string
    title: string
    color: string
  }
  tasks: KanbanTask[]
}

export const KanbanColumn = ({ column, tasks }: KanbanColumnProps) => {
  const { createTask } = useKanbanStore()
  const locale = useParams()?.locale as LocaleTypes
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const handleAddTask = () => {
    createTask({
      title: 'New Task',
      status: column.id as any,
      priority: 'medium',
      tags: [],
      language: locale || 'en',
      boardId: 'default',
      order: tasks.length,
    })
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[320px] flex-1 flex-col rounded-lg ${column.color} p-4 transition-colors ${
        isOver ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{column.title}</h3>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={handleAddTask}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          aria-label={`Add task to ${column.title}`}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

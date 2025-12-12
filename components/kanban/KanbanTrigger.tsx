'use client'

import { useKanbanStore } from './store'
import { Squares2X2Icon } from '@heroicons/react/24/outline'

export const KanbanTrigger = () => {
  const { onOpen } = useKanbanStore()

  return (
    <button
      onClick={onOpen}
      className="rounded-lg p-2 text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
      aria-label="Open Kanban board"
      title="Kanban Board (Ctrl+K)"
    >
      <Squares2X2Icon className="h-6 w-6" />
    </button>
  )
}

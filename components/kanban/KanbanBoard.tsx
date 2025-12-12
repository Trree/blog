'use client'

import { DndContext, DragOverlay, closestCorners, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { useKanbanStore } from './store'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
]

export const KanbanBoard = () => {
  const { tasks, moveTask } = useKanbanStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const overId = over.id as string
    const activeTask = tasks.find((t) => t.id === active.id)

    if (!activeTask) return

    // Check if over a column
    const overColumn = COLUMNS.find((c) => c.id === overId)
    if (overColumn && activeTask.status !== overColumn.id) {
      // Move to new column
      const tasksInColumn = tasks.filter((t) => t.status === overColumn.id)
      const newOrder = tasksInColumn.length
      moveTask(active.id as string, overColumn.id, newOrder)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)

    // TODO: Call API to persist
    // const { active } = event
    // await fetch('/api/kanban/update', { ... })
  }

  const activeTask = tasks.find((t) => t.id === activeId)

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-6 p-6">
        {COLUMNS.map((column) => {
          const columnTasks = tasks
            .filter((task) => task.status === column.id)
            .sort((a, b) => a.order - b.order)

          return <KanbanColumn key={column.id} column={column} tasks={columnTasks} />
        })}
      </div>

      <DragOverlay>{activeTask ? <KanbanCard task={activeTask} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}

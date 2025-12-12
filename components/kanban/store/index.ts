import { create } from 'zustand'
import type { KanbanTask } from 'contentlayer/generated'

interface KanbanStore {
  // 模态框状态
  isOpen: boolean
  onOpen: () => void
  onClose: () => void

  // 任务列表
  tasks: KanbanTask[]
  setTasks: (tasks: KanbanTask[]) => void

  // 编辑状态
  editingTaskId: string | null
  setEditingTask: (taskId: string | null) => void

  // 乐观更新
  moveTask: (taskId: string, newStatus: string, newOrder: number) => void
  updateTask: (taskId: string, updates: Partial<KanbanTask>) => void
  deleteTask: (taskId: string) => void
  createTask: (task: Partial<KanbanTask>) => void
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false, editingTaskId: null }),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),

  editingTaskId: null,
  setEditingTask: (taskId) => set({ editingTaskId: taskId }),

  moveTask: (taskId, newStatus, newOrder) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus as any, order: newOrder, updatedAt: new Date() }
          : task
      ),
    })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),

  createTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as KanbanTask,
      ],
    })),
}))

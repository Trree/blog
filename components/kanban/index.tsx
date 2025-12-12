'use client'

import { useEffect } from 'react'
import { allKanbanTasks } from 'contentlayer/generated'
import { useParams } from 'next/navigation'
import type { LocaleTypes } from '@/app/[locale]/i18n/settings'
import { KanbanModal } from './KanbanModal'
import { useKanbanStore } from './store'

export const KanbanProvider = () => {
  const { setTasks, onOpen } = useKanbanStore()
  const locale = useParams()?.locale as LocaleTypes

  // 加载任务
  useEffect(() => {
    const localeTasks = allKanbanTasks.filter((task) => task.language === locale)
    setTasks(localeTasks)
  }, [locale, setTasks])

  // 全局快捷键: Ctrl+K 或 Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onOpen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpen])

  return <KanbanModal />
}

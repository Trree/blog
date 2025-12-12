'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useRef, useEffect } from 'react'
import { useOuterClick } from '../util/useOuterClick'
import { useKanbanStore } from './store'
import { KanbanBoard } from './KanbanBoard'
import { XMarkIcon } from '@heroicons/react/24/outline'

const variants = {
  hidden: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const KanbanModal = () => {
  const { isOpen, onClose } = useKanbanStore()
  const modalRef = useRef<HTMLDivElement>(null)

  useOuterClick(modalRef, onClose)

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: 'spring', duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300/50 backdrop-blur-sm backdrop-filter dark:bg-black/50"
      >
        <div
          ref={modalRef}
          className="relative mx-4 h-[90vh] w-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-white">Kanban Board</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Close kanban board"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Board Content */}
          <div className="h-[calc(90vh-5rem)] overflow-auto">
            <KanbanBoard />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

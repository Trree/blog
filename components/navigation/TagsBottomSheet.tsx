'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useTagStore } from '@/components/util/useTagStore'
import { useBottomSheetStore } from '@/components/util/useBottomSheetStore'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import tagData from 'app/[locale]/tag-data.json'

interface TagsBottomSheetProps {
  locale: LocaleTypes
}

export default function TagsBottomSheet({ locale }: TagsBottomSheetProps) {
  const { t } = useTranslation(locale, 'common')
  const router = useRouter()
  const isOpen = useBottomSheetStore((state) => state.isTagSheetOpen)
  const closeTagSheet = useBottomSheetStore((state) => state.closeTagSheet)
  const selectedTag = useTagStore((state) => state.selectedTag)
  const setSelectedTag = useTagStore((state) => state.setSelectedTag)
  const [searchQuery, setSearchQuery] = useState('')
  const [dragOffset, setDragOffset] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const tagCountMap = tagData[locale] || {}

  // Sort tags by count (descending) and alphabetically
  const sortedTags = useMemo(() => {
    return Object.entries(tagCountMap).sort((a, b) => {
      // First by count (descending)
      const countDiff = b[1] - a[1]
      if (countDiff !== 0) return countDiff
      // Then alphabetically
      return a[0].localeCompare(b[0])
    })
  }, [tagCountMap])

  // Popular tags (top 6)
  const popularTags = useMemo(() => sortedTags.slice(0, 6), [sortedTags])

  // All tags alphabetically
  const allTagsAlphabetically = useMemo(() => {
    return Object.entries(tagCountMap).sort((a, b) => a[0].localeCompare(b[0]))
  }, [tagCountMap])

  // Filtered tags based on search
  const filteredTags = useMemo(() => {
    if (!searchQuery) return allTagsAlphabetically
    const query = searchQuery.toLowerCase()
    return allTagsAlphabetically.filter(([tag]) => tag.toLowerCase().includes(query))
  }, [allTagsAlphabetically, searchQuery])

  // Handle tag selection
  const handleTagClick = useCallback(
    (tag: string) => {
      setSelectedTag(tag)
      closeTagSheet()
      router.push(`/${locale}/blog`)
    },
    [setSelectedTag, closeTagSheet, router, locale]
  )

  // Handle clear filter
  const handleClearFilter = useCallback(() => {
    setSelectedTag('')
    closeTagSheet()
  }, [setSelectedTag, closeTagSheet])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeTagSheet()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeTagSheet])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const firstFocusable = sheetRef.current.querySelector<HTMLElement>(
        'button, input'
      )
      firstFocusable?.focus()
    }
  }, [isOpen])

  const sheetVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 30, stiffness: 300 },
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-60 bg-black/20 backdrop-blur-sm"
            onClick={closeTagSheet}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 150 || velocity.y > 500) {
                closeTagSheet()
              }
            }}
            onDrag={(e, { offset }) => {
              setDragOffset(Math.max(0, offset.y))
            }}
            className="fixed inset-x-0 bottom-0 z-60 flex max-h-[75vh] flex-col rounded-t-3xl border-t border-white/30 bg-white/95 backdrop-blur-2xl shadow-glass dark:border-white/[0.15] dark:bg-gray-900/95"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tags-sheet-title"
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200/50 px-6 pb-4 dark:border-gray-700/50">
              <h2
                id="tags-sheet-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {t('tags.filterByTag') || 'Filter by Tag'}
              </h2>
              <button
                onClick={closeTagSheet}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder={t('tags.searchTags') || 'Search tags...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
                />
              </div>

              {/* Active Filter */}
              {selectedTag && (
                <div className="mb-6">
                  <div className="flex items-center justify-between rounded-2xl border border-primary-500/50 bg-primary-500/10 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        Active Filter
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-primary-600 dark:text-primary-200">
                        {selectedTag}
                      </p>
                    </div>
                    <button
                      onClick={handleClearFilter}
                      className="text-sm font-semibold text-primary-600 transition hover:text-primary-700 dark:text-primary-200 dark:hover:text-primary-100"
                    >
                      {t('tags.clearFilter') || 'Clear'}
                    </button>
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              {!searchQuery && popularTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
                    {t('tags.popularTags') || 'Popular Tags'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(([tag, count]) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`min-h-[48px] rounded-full border px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition active:scale-95 ${
                          selectedTag === tag
                            ? 'border-primary-500/60 bg-primary-500/10 text-primary-600 dark:text-primary-200'
                            : 'border-gray-200/70 bg-white/50 text-gray-700 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 dark:border-white/10 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-primary-500/50 dark:hover:bg-primary-900/20'
                        }`}
                      >
                        <span>{tag}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Tags */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
                  {t('tags.allTags') || 'All Tags'}
                </h3>
                {filteredTags.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredTags.map(([tag, count]) => (
                      <li key={tag}>
                        <button
                          onClick={() => handleTagClick(tag)}
                          className={`w-full min-h-[48px] rounded-2xl border px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide transition active:scale-[0.98] ${
                            selectedTag === tag
                              ? 'border-primary-400/70 bg-primary-500/10 text-primary-600 dark:text-primary-200'
                              : 'border-gray-200/70 bg-white/50 text-gray-700 hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-500 dark:border-white/10 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-primary-500/30 dark:hover:bg-primary-900/10'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span>{tag}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {count}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('tags.noPosts') || 'No tags found'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

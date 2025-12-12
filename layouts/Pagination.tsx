import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import React, { useCallback } from 'react'

interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  params: { locale: LocaleTypes }
}
export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  params: { locale },
}: PaginationProps): React.JSX.Element {
  const { t } = useTranslation(locale, 'home')
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  const handlePrevPage = useCallback(() => {
    if (prevPage) {
      onPageChange(currentPage - 1)
    }
  }, [prevPage, currentPage, onPageChange])

  const handleNextPage = useCallback(() => {
    if (nextPage) {
      onPageChange(currentPage + 1)
    }
  }, [nextPage, currentPage, onPageChange])

  return (
    <div className="mt-10">
      <nav className="flex items-center justify-between rounded-full border border-white/30 bg-white/80 px-4 py-3 text-sm font-semibold shadow-glow backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
        <button
          onClick={handlePrevPage}
          disabled={!prevPage}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${
            prevPage
              ? 'text-gray-900 hover:text-primary-500 dark:text-white'
              : 'cursor-not-allowed text-gray-400 dark:text-gray-500'
          }`}
        >
          <span aria-hidden="true">←</span>
          {t('prevp')}
        </button>
        <span className="text-xs uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
          {currentPage} {t('of')} {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={!nextPage}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${
            nextPage
              ? 'text-gray-900 hover:text-primary-500 dark:text-white'
              : 'cursor-not-allowed text-gray-400 dark:text-gray-500'
          }`}
        >
          {t('nextp')}
          <span aria-hidden="true">→</span>
        </button>
      </nav>
    </div>
  )
}

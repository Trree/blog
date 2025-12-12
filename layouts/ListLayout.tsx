'use client'

import Link from '@/components/mdxcomponents/Link'
import { sortByDate } from '@/components/util/sortByDate'
import { useTagStore } from '@/components/util/useTagStore'
import { POSTS_PER_PAGE } from '@/data/postsPerPage'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import tagData from 'app/[locale]/tag-data.json'
import type { Blog } from 'contentlayer/generated'
import { motion } from 'framer-motion'
import type { CoreContent } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'
import React, { useCallback, useMemo, useState } from 'react'
import Pagination from './Pagination'

interface PaginationProps {
  totalPages: number
  currentPage: number
  params: { locale: LocaleTypes }
}

interface PostWithTags extends CoreContent<Blog> {
  tags: string[]
  summary?: string
  [key: string]: unknown
}

interface ListLayoutProps {
  params: { locale: LocaleTypes }
  posts: PostWithTags[]
  title: string
  initialDisplayPosts?: PostWithTags[]
  pagination?: PaginationProps
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, x: -25, y: 0 },
  show: { opacity: 1, x: 0, y: 0 },
}

export default function ListLayoutWithTags({
  params: { locale },
  posts,
  title,
}: ListLayoutProps): React.JSX.Element {
  const { t } = useTranslation(locale, 'home')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = POSTS_PER_PAGE
  const sortedPosts = sortByDate(posts)
  const selectedTag = useTagStore((state) => state.selectedTag)
  const setSelectedTag = useTagStore((state) => state.setSelectedTag)

  const filteredPosts = useMemo(() => {
    if (selectedTag) {
      return sortedPosts.filter((post) => {
        const tags = post.tags as string[]
        return tags.includes(selectedTag)
      })
    }
    return sortedPosts
  }, [selectedTag, sortedPosts])

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const displayPosts = filteredPosts.slice(startIndex, endIndex)

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleTagClick = useCallback(
    (tag: string) => {
      setSelectedTag(selectedTag === tag ? '' : tag)
      setCurrentPage(1)
    },
    [selectedTag, setSelectedTag, setCurrentPage]
  )

  const handleClearTag = useCallback(() => {
    setSelectedTag('')
    setCurrentPage(1)
  }, [setSelectedTag, setCurrentPage])

  const tagCountMap = tagData[locale]

  const createTagClickHandler = useCallback(
    (postTag: string) => {
      return () => handleTagClick(postTag)
    },
    [handleTagClick]
  )

  const filteredTags = Object.keys(tagCountMap).map((postTag) => {
    const isActive = selectedTag === postTag
    return (
      <li key={postTag}>
        <button
          onClick={createTagClickHandler(postTag)}
          aria-labelledby={`${t('poststagged')} ${postTag}`}
          className={`w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide transition ${
            isActive
              ? 'border-primary-400/70 bg-primary-500/10 text-primary-600 dark:text-primary-200'
              : 'border-gray-200/70 text-gray-600 hover:border-primary-200 hover:text-primary-500 dark:border-white/10 dark:text-gray-200'
          }`}
        >
          <span className="flex items-center justify-between">
            <span>{postTag}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tagCountMap[postTag]}
            </span>
          </span>
        </button>
      </li>
    )
  })

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/30 bg-white/80 px-6 py-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
              {t('searchposts')}
            </p>
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          </div>
          {selectedTag ? (
            <button
              onClick={handleClearTag}
              className="inline-flex items-center gap-2 rounded-full border border-primary-500/50 px-4 py-2 text-sm font-semibold text-primary-600 transition hover:border-primary-500 dark:text-primary-200"
            >
              {selectedTag}
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="order-2 flex w-full flex-col gap-4 rounded-3xl border border-white/30 bg-white/80 px-5 py-6 shadow-glow backdrop-blur dark:border-white/10 dark:bg-white/[0.04] lg:order-1 lg:w-80">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
              {t('poststagged')}
            </p>
            <button
              onClick={handleClearTag}
              className={`text-xs font-semibold uppercase tracking-wide ${
                selectedTag ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('all')}
            </button>
          </div>
          <ul className="space-y-2">{filteredTags}</ul>
        </aside>
        <div className="order-1 flex-1 lg:order-2">
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2"
          >
            {displayPosts.map((post) => {
              const slug = post.slug as string
              const date = post.date as string
              const postTitle = post.title as string
              const summary = post.summary as string | undefined
              const tags = post.tags as string[]
              const language = post.language as string

              if (language === locale) {
                return (
                  <motion.li variants={item} key={slug} className="h-full">
                    <article className="group relative flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/80 p-6 shadow-glow transition hover:-translate-y-1 hover:border-primary-300/60 dark:border-white/[0.08] dark:bg-white/[0.04]">
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                        aria-hidden="true"
                      />
                      <dl className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          <dt className="sr-only">{t('pub')}</dt>
                          <dd>
                            <time dateTime={date}>{formatDate(date, language)}</time>
                          </dd>
                        </div>
                        <div className="text-xs uppercase tracking-[0.4em] text-gray-400">
                          {tags[0] ?? t('all')}
                        </div>
                      </dl>
                      <div className="mt-5 flex-1 space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                          <Link href={`/${locale}/blog/${slug}`}>{postTitle}</Link>
                        </h2>
                        <div className="text-gray-600 dark:text-gray-300">
                          {summary && summary.length > 149
                            ? `${summary.substring(0, 149)}...`
                            : summary}
                        </div>
                        <ul className="flex flex-wrap gap-2">
                          {tags.map((tLabel) => (
                            <li key={tLabel}>
                              <button
                                onClick={createTagClickHandler(tLabel)}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                                  selectedTag === tLabel
                                    ? 'border-primary-500/60 bg-primary-500/10 text-primary-600 dark:text-primary-200'
                                    : 'border-gray-200/60 text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-white/10 dark:text-gray-200'
                                }`}
                                aria-label={`View posts tagged ${tLabel}`}
                              >
                                {tLabel}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-6 flex items-center justify-between text-sm font-semibold">
                        <Link
                          href={`/${locale}/blog/${slug}`}
                          className="inline-flex items-center gap-2 text-gray-900 hover:text-primary-500 dark:text-gray-100"
                          aria-label={`${t('more')}"${postTitle}"`}
                        >
                          {t('more')}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  </motion.li>
                )
              }
              return null
            })}
          </motion.ul>
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
              params={{ locale }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

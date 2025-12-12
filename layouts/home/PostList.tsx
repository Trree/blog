import Link from '@/components/mdxcomponents/Link'
import Tag from '@/components/tag'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { formatDate } from 'pliny/utils/formatDate'
import React from 'react'

interface Post {
  slug: string
  date: string
  title: string
  summary?: string | undefined
  tags: string[]
  language: string
  draft?: boolean
}

interface PostListProps {
  posts: Post[]
  locale: LocaleTypes
  t: (key: string) => string
  maxDisplay: number
}

const PostList: React.FC<PostListProps> = ({ posts, locale, t, maxDisplay }) => {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {!posts.length && <li>{t('noposts')}</li>}
      {posts.slice(0, maxDisplay).map((post) => {
        const { slug, date, title, summary, tags } = post
        const primaryTag = tags[0]
        return (
          <li key={slug} className="h-full">
            <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-6 shadow-glow transition duration-300 hover:-translate-y-1 hover:border-primary-300/60 hover:shadow-2xl dark:border-white/[0.08] dark:bg-white/[0.04]">
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/15 via-transparent to-accent-400/10" />
              </div>
              <dl className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div>
                  <dt className="sr-only">{t('pub')}</dt>
                  <dd>
                    <time dateTime={date}>{formatDate(date, locale)}</time>
                  </dd>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  {primaryTag ?? t('all')}
                </div>
              </dl>
              <div className="mt-5 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 transition group-hover:text-primary-600 dark:text-white">
                  <Link href={`/${locale}/blog/${slug}`}>{title}</Link>
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  {summary && summary.length > 149
                    ? `${summary.substring(0, 149)}...`
                    : summary}
                </div>
                <ul className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <li key={tag}>
                      <Tag text={tag} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold">
                <Link
                  href={`/${locale}/blog/${slug}`}
                  className="inline-flex items-center gap-2 text-gray-900 transition hover:text-primary-500 dark:text-gray-100"
                  aria-label={`${t('more')}"${title}"`}
                >
                  {t('more')}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}

export default PostList

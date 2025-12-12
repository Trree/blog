import Link from '@/components/mdxcomponents/Link'
import NewsletterForm from '@/components/newletter/NewsletterForm'
import { maintitle } from '@/data/localeMetadata'
import siteMetadata from '@/data/siteMetadata'
import React from 'react'
import { createTranslation } from '../app/[locale]/i18n/server'
import type { LocaleTypes } from '../app/[locale]/i18n/settings'
import LayoutHeader from './home/LayoutHeader'
import PostList from './home/PostList'

interface Post {
  slug: string
  date: string
  title: string
  summary?: string | undefined
  tags: string[]
  language: string
  draft?: boolean
}

interface HomeProps {
  posts: Post[]
  params: { locale: LocaleTypes }
}

const MAX_DISPLAY = 5

export default async function HomeLayout({
  posts,
  params: { locale },
}: HomeProps): Promise<React.JSX.Element> {
  const { t } = await createTranslation(locale, 'home')
  const totalPosts = posts.length
  const topics = new Set<string>()
  posts.forEach((post) => post.tags.forEach((tag) => topics.add(tag)))

  return (
    <>
      <div className="space-y-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/80 px-6 py-10 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:px-10">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 rounded-l-full bg-gradient-to-b from-primary-400/40 via-accent-400/30 to-primary-500/40 blur-3xl lg:block"
            aria-hidden="true"
          />
          <div className="relative grid gap-10 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border border-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-gray-500 dark:border-white/10 dark:text-gray-400">
                {t('greeting')}
              </p>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white sm:text-5xl">
                {maintitle[locale]}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">{t('description')}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/blog`}
                  className="inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900"
                >
                  {t('all')}
                </Link>
                <Link
                  href={`/${locale}/projects`}
                  className="inline-flex items-center rounded-full border border-gray-200/70 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-white/20 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-200"
                >
                  {t('ctaProjects')}
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-innerGlow backdrop-blur dark:border-white/[0.06] dark:bg-white/[0.05]">
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('statsPosts')}
                  </dt>
                  <dd className="text-4xl font-semibold text-gray-900 dark:text-white">
                    {totalPosts.toString().padStart(2, '0')}+
                  </dd>
                </div>
                <div>
                  <dt className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('statsTopics')}
                  </dt>
                  <dd className="text-4xl font-semibold text-gray-900 dark:text-white">
                    {topics.size.toString().padStart(2, '0')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <LayoutHeader title={t('greeting')} description={t('description')} />
          <PostList posts={posts} locale={locale} t={t} maxDisplay={MAX_DISPLAY} />
        </div>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-gray-900 transition hover:border-primary-400 hover:text-primary-600 dark:text-gray-100"
            aria-label={t('all')}
          >
            {t('all')} &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider ? (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      ) : null}
    </>
  )
}

import Tag from '@/components/tag'
import { genPageMetadata } from 'app/[locale]/seo'
import tagData from 'app/[locale]/tag-data.json'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'
import { allBlogs } from 'contentlayer/generated'
import { generateGraphData } from '@/lib/graph-utils'
import GraphClientWrapper from './graph/GraphClientWrapper'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'SEO')
  return genPageMetadata({
    title: 'Tags',
    description: t('tags'),
    params: { locale },
  })
}

export default async function Page({ params }: PageProps): Promise<ReactElement> {
  const { locale } = await params
  const tagCounts = tagData[locale]
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  // 生成图谱数据
  const posts = allBlogs.filter((post) => post.language === locale)
  const graphData = generateGraphData(posts)

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* 标签列表 - 紧凑设计 */}
      <div className="space-y-3 pt-6 pb-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
            {locale === 'zh' ? '标签' : 'Tags'}
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tagKeys.length} {locale === 'zh' ? '个标签' : 'tags'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tagKeys.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              {locale === 'zh' ? '暂无标签' : 'No tags found.'}
            </p>
          )}
          {sortedTags.map((tag) => (
            <div key={tag} className="flex items-baseline gap-1">
              <Tag text={tag} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {tagCounts[tag]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 关系图谱 */}
      <div className="py-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {locale === 'zh' ? '关系图谱' : 'Relationship Graph'}
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {locale === 'zh'
              ? '通过共享标签可视化展示文章之间的联系'
              : 'Visualize connections between posts through shared tags'}
          </p>
        </div>
        <GraphClientWrapper graphData={graphData} locale={locale} />
      </div>
    </div>
  )
}

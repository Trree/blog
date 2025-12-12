import { createTranslation } from 'app/[locale]/i18n/server'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import React from 'react'
import LayoutHeader from './home/LayoutHeader'
import TagConstellation, { type TagNodeData } from '@/components/home/TagConstellation'

interface HomeProps {
  tagNodes: TagNodeData[]
  params: { locale: LocaleTypes }
}

export default async function FeaturedLayout({
  tagNodes,
  params: { locale },
}: HomeProps): Promise<React.JSX.Element> {
  const { t } = await createTranslation(locale, 'home')
  return (
    <section className="space-y-6 rounded-3xl border border-white/30 bg-white/80 px-6 py-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:px-10">
      <LayoutHeader title={t('featured')} />
      <TagConstellation tagNodes={tagNodes} />
    </section>
  )
}

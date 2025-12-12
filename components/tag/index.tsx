'use client'

import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useCallback } from 'react'
import { useTagStore } from '../util/useTagStore'

interface Props {
  text: string
}

const Tag = ({ text }: Props): React.JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { setSelectedTag } = useTagStore()

  const handleClick = useCallback(() => {
    setSelectedTag(text)
  }, [text, setSelectedTag])

  return (
    <Link
      href={`/${locale}/blog`}
      onClick={handleClick}
      className="inline-flex items-center rounded-full border border-gray-200/70 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 transition hover:border-primary-500 hover:text-primary-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-200"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag

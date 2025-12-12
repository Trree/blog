'use client'

import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import siteMetadata from '@/data/siteMetadata'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { motion } from 'framer-motion'
import { useParams, usePathname } from 'next/navigation'
import type { JSX } from 'react'
import LangSwitch from '../langswitch'
import Link from '../mdxcomponents/Link'
import SearchButton from '../search/SearchButton'
import ThemeSwitch from '../theme/ThemeSwitch'
import { KanbanTrigger } from '../kanban/KanbanTrigger'
import AuthorsMenu from './AuthorsMenu'
import MobileNav from './MobileNav'

const Header = (): JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const pathname = usePathname()

  return (
    <header className="sticky top-6 z-40">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/40 bg-white/80 px-4 py-4 shadow-glass backdrop-blur-xl transition duration-300 dark:border-white/[0.15] dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/`}
            aria-label={siteMetadata.headerTitle}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-400 text-white shadow-glow">
              <Logo />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                {typeof siteMetadata.headerTitle === 'string'
                  ? siteMetadata.headerTitle
                  : t('home')}
              </span>
              <span className="max-w-[220px] truncate text-xs text-gray-500 dark:text-gray-400">
                {siteMetadata.description}
              </span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <nav className="hidden items-center gap-1 text-sm font-semibold sm:flex">
            {headerNavLinks
              .filter((link) => link.href !== '/')
              .map((link) => {
                const isSelected = pathname.includes(link.href as string)
                return (
                  <Link
                    key={link.title}
                    href={`/${locale}${link.href}`}
                    className="relative rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <span className="relative z-10">{t(`${link.title.toLowerCase()}`)}</span>
                    {isSelected ? (
                      <motion.span
                        layoutId="header-tab"
                        transition={{ type: 'spring', duration: 0.45 }}
                        className="absolute inset-0 z-0 rounded-full bg-gray-900/10 dark:bg-white/10"
                      />
                    ) : null}
                  </Link>
                )
              })}
          </nav>
          <AuthorsMenu className="hidden sm:block" />
          <div className="flex items-center gap-2 rounded-full border border-gray-200/60 bg-white/70 px-3 py-1 shadow-innerGlow dark:border-white/[0.08] dark:bg-white/[0.02]">
            <SearchButton />
            <KanbanTrigger />
            <ThemeSwitch />
            <LangSwitch />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header

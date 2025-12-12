'use client'

import { motion } from 'framer-motion'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useTranslation } from 'app/[locale]/i18n/client'
import { useBottomSheetStore } from '@/components/util/useBottomSheetStore'
import { type JSX, type SVGProps } from 'react'
import TagsBottomSheet from './TagsBottomSheet'

// Icon components
function HomeIcon({ className, ...props }: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  )
}

function BlogIcon({ className, ...props }: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  )
}

function TagsIcon({ className, ...props }: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  )
}

interface TabItem {
  id: string
  href?: string
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
  labelKey: string
  onClick?: () => void
}

export default function BottomNav(): JSX.Element {
  const pathname = usePathname()
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const openTagSheet = useBottomSheetStore((state) => state.openTagSheet)

  const tabs: TabItem[] = [
    {
      id: 'home',
      href: `/${locale}`,
      icon: HomeIcon,
      labelKey: 'home',
    },
    {
      id: 'blog',
      href: `/${locale}/blog`,
      icon: BlogIcon,
      labelKey: 'blog',
    },
    {
      id: 'tags',
      icon: TagsIcon,
      labelKey: 'tags',
      onClick: openTagSheet,
    },
  ]

  // Determine active tab based on pathname
  const getActiveTab = (): string => {
    if (pathname === `/${locale}` || pathname === `/${locale}/`) {
      return 'home'
    }
    if (pathname?.startsWith(`/${locale}/blog`)) {
      return 'blog'
    }
    return ''
  }

  const activeTab = getActiveTab()

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/40 bg-white/80 backdrop-blur-xl shadow-glow dark:border-white/[0.15] dark:bg-white/[0.04] sm:hidden"
        aria-label="Primary mobile navigation"
        role="navigation"
      >
        <div className="flex h-16 items-center justify-around px-4 pb-safe">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            if (tab.onClick) {
              return (
                <button
                  key={tab.id}
                  onClick={tab.onClick}
                  className="relative flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all active:scale-95"
                  aria-label={t(`nav.${tab.labelKey}`) || tab.labelKey}
                >
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-indicator"
                      className="absolute inset-0 z-0 rounded-xl bg-gray-900/10 dark:bg-white/10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 h-6 w-6 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-xs font-semibold ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {t(`nav.${tab.labelKey}`) || tab.labelKey}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={tab.id}
                href={tab.href!}
                className="relative flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all active:scale-95"
                aria-label={t(`nav.${tab.labelKey}`) || tab.labelKey}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 z-0 rounded-xl bg-gray-900/10 dark:bg-white/10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-6 w-6 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                />
                <span
                  className={`relative z-10 text-xs font-semibold ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t(`nav.${tab.labelKey}`) || tab.labelKey}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Tags Bottom Sheet */}
      <TagsBottomSheet locale={locale} />
    </>
  )
}

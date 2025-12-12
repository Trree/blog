'use client'

import headerNavLinks from '@/data/headerNavLinks'
import siteMetadata from '@/data/siteMetadata'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { allAuthors } from 'contentlayer/generated'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useCallback, useState, type JSX, type SVGProps } from 'react'
import Link from '../mdxcomponents/Link'

export function ChevronDownIcon({ className, ...props }: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...props} className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.135 6.158a.5.5 0 0 1 .707-.023L7.5 9.565l3.658-3.43a.5.5 0 0 1 .684.73l-4 3.75a.5.5 0 0 1-.684 0l-4-3.75a.5.5 0 0 1-.023-.707"
        clipRule="evenodd"
      />
    </svg>
  )
}

const MobileNav = (): JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const authors = allAuthors
    .filter((a) => a.language === locale)
    .sort((a, b) => (a.default === b.default ? 0 : a.default ? -1 : 1))

  const mainAuthor = allAuthors.filter((a) => a.default === true && a.language === locale)

  const [navShow, setNavShow] = useState<boolean>(false)
  const [accordionOpen, setAccordionOpen] = useState<boolean>(false)

  const onToggleNav = useCallback(() => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = 'auto'
      } else {
        document.body.style.overflow = 'hidden'
      }
      return !status
    })
  }, [])

  const toggleAccordion = useCallback(() => {
    setAccordionOpen(!accordionOpen)
  }, [accordionOpen])

  return (
    <>
      <button
        aria-label={t('showmenu')}
        onClick={useCallback(() => onToggleNav(), [onToggleNav])}
        className="sm:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-8 w-8 text-gray-800 dark:text-gray-100"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`fixed top-0 left-0 z-50 h-full w-full transform overflow-y-auto bg-white/95 backdrop-blur-2xl transition duration-300 ease-in-out dark:bg-gray-900/95 sm:hidden ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex min-h-full flex-col">
          {/* Close button */}
          <button
            onClick={useCallback(() => onToggleNav(), [onToggleNav])}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <nav className="flex flex-1 flex-col px-4 py-16 pb-safe">
            {/* Secondary navigation - Projects */}
            <div className="mb-3">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
                {t('explore') || 'Explore'}
              </h3>
              {headerNavLinks
                .filter((link) => link.href === '/projects')
                .map((link) => (
                  <Link
                    key={link.title}
                    href={`/${locale}${link.href}`}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white px-5 py-3 text-left text-base font-semibold text-gray-900 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98] dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-800"
                    onClick={useCallback(() => onToggleNav(), [onToggleNav])}
                  >
                    <span className="relative z-10">{t(`nav.${link.title.toLowerCase()}`)}</span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-accent-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
            </div>

            {/* Divider */}
            <div className="my-3 border-t border-gray-200/50 dark:border-gray-700/50" />

            {/* About section */}
            {siteMetadata.multiauthors ? (
              <div className="mt-3">
                <button
                  type="button"
                  className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-white px-5 py-3 text-left text-base font-semibold text-gray-900 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-800"
                  onClick={useCallback(() => toggleAccordion(), [toggleAccordion])}
                >
                  <span className="relative z-10">{t('about')}</span>
                  <motion.div
                    animate={{ rotate: accordionOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </motion.div>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-accent-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: accordionOpen ? 'auto' : 0, opacity: accordionOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-gray-50/50 p-1.5 dark:border-gray-800 dark:bg-gray-800/30">
                    {authors.map((author) => {
                      const { name, avatar, language, slug } = author
                      if (language === locale) {
                        return (
                          <Link
                            key={name}
                            href={`/${locale}/about/${slug}`}
                            onClick={useCallback(() => onToggleNav(), [onToggleNav])}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-white dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <Image
                              className="h-7 w-7 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                              src={avatar ?? ''}
                              title="avatar"
                              alt="avatar"
                              width={28}
                              height={28}
                            />
                            <span className="truncate">{name}</span>
                          </Link>
                        )
                      }
                      return null
                    })}
                  </div>
                </motion.div>
              </div>
            ) : null}
            {siteMetadata.multiauthors === false && (
              <div className="mt-3">
                {mainAuthor.map((author) => {
                  const { name, language, slug } = author
                  if (language === locale) {
                    return (
                      <Link
                        href={`/${locale}/about/${slug}`}
                        onClick={useCallback(() => onToggleNav(), [onToggleNav])}
                        key={name}
                        className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-white px-5 py-3 text-left text-base font-semibold text-gray-900 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98] dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <span className="relative z-10">{t('about')}</span>
                        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-accent-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    )
                  }
                  return null
                })}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}

export default MobileNav

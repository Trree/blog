'use client'

import SocialIcon from '@/components/social-icons'
import { maintitle } from '@/data/localeMetadata'
import siteMetadata from '@/data/siteMetadata'
import Link from '../mdxcomponents/Link'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams } from 'next/navigation'
import { useCallback, type JSX } from 'react'

import { ContactModal } from '../formspree'
import { useContactModal } from '../formspree/store'

export default function Footer(): JSX.Element {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'footer')
  const contactModal = useContactModal()

  const handleContactClick = useCallback((): void => {
    contactModal.onOpen()
  }, [contactModal])

  return (
    <>
      <footer className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/80 px-6 py-10 text-center shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:px-10">
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-gradient-to-r from-primary-400/40 via-accent-400/40 to-primary-400/40 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">
              {t('crafted')}
            </p>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              {maintitle[locale]}
            </h2>
            <p className="max-w-2xl text-base text-gray-600 dark:text-gray-300">
              {siteMetadata.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {siteMetadata.formspree === false ? (
                <Link
                  href={`mailto:${siteMetadata.email}`}
                  className="rounded-full border border-gray-200/80 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-white/10 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-200"
                >
                  {t('connect')}
                </Link>
              ) : (
                <button
                  className="rounded-full border border-gray-200/80 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-white/10 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-200"
                  onClick={handleContactClick}
                >
                  {t('connect')}
                </button>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {siteMetadata.formspree === false ? (
                  <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
                ) : (
                  <button
                    className="flex items-center"
                    onClick={handleContactClick}
                    aria-label={t('connect')}
                  >
                    <SocialIcon kind="mail" size={6} />
                  </button>
                )}
                <SocialIcon kind="github" href={siteMetadata.github} size={6} />
                <SocialIcon kind="facebook" href={siteMetadata.facebook} size={6} />
                <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
                <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
                <SocialIcon kind="x" href={siteMetadata.x} size={6} />
                <SocialIcon kind="instagram" href={siteMetadata.instagram} size={6} />
                <SocialIcon kind="threads" href={siteMetadata.threads} size={6} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{siteMetadata.author}</span>
              <span>•</span>
              <span>{`© ${new Date().getFullYear()}`}</span>
              <span>•</span>
              <span>{t('rights')}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <Link href="https://github.com/PxlSyl/tailwind-nextjs-starter-blog-i18n" className="hover:text-primary-500">
                {t('theme')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <ContactModal />
    </>
  )
}

'use client'

import siteMetadata from '@/data/siteMetadata'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Radio,
  RadioGroup,
  Transition,
} from '@headlessui/react'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { allAuthors, type Authors } from 'contentlayer/generated'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useCallback, useMemo, useRef, useState, type JSX } from 'react'
import { useOuterClick } from '../util/useOuterClick'

type AuthorsMenuProps = {
  className: string
}

const AuthorsMenu = ({ className }: AuthorsMenuProps): JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const pathname = usePathname()
  const sections = pathname.split('/')
  const lastSection = sections[sections.length - 1]
  const filterSections = pathname !== `/${locale}` && pathname !== '/'

  const authors = useMemo(
    () =>
      allAuthors
        .filter((a) => a.language === locale)
        .sort((a, b) => (a.default === b.default ? 0 : a.default ? -1 : 1)),
    [locale]
  )

  const mainAuthor = useMemo(
    () => allAuthors.filter((a) => a.default === true && a.language === locale),
    [locale]
  )

  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const closeMenu = () => {
    setIsOpen(false)
  }

  const menubarRef = useRef<HTMLDivElement>(null)
  useOuterClick(menubarRef, closeMenu)

  const isSelected = authors.some((author) => author.slug.includes(lastSection)) && filterSections

  const renderAuthorLink = (author: Authors) => {
    const { name, avatar, slug } = author
    return (
      <Radio key={name} value={name}>
        <MenuItem>
          {({ focus }) => (
            <div
              className={`${
                focus
                  ? 'bg-gray-100/80 dark:bg-white/[0.08]'
                  : 'hover:bg-gray-100/70 dark:hover:bg-white/[0.05]'
              } flex w-full cursor-pointer items-center rounded-xl px-3 py-2 text-sm text-gray-600 transition dark:text-gray-200`}
            >
              <div className="mr-2">
                <Image
                  className="rounded-full"
                  src={avatar ?? ''}
                  alt="avatar"
                  title="avatar"
                  width={25}
                  height={25}
                />
              </div>
              <Link
                href={`/${locale}/about/${slug}`}
                onClick={useCallback(() => closeMenu(), [closeMenu])}
                className="font-semibold text-gray-800 dark:text-gray-100"
              >
                {name}
              </Link>
            </div>
          )}
        </MenuItem>
      </Radio>
    )
  }

  return siteMetadata.multiauthors ? (
    <div ref={menubarRef} className={className}>
      <Menu as="div" className="relative inline-block text-left font-medium">
        <MenuButton
          className={`group relative hidden overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition-colors sm:flex ${
            isSelected
              ? 'border-transparent text-white'
              : 'border-gray-200/70 text-gray-600 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:text-white'
          }`}
          onClick={useCallback(() => toggleMenu(), [toggleMenu])}
        >
          <span className="relative z-10">{t('about')}</span>
          {isSelected ? (
            <motion.span
              layoutId="author-tab"
              transition={{ type: 'spring', duration: 0.45 }}
              className="absolute inset-0 z-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-90"
              aria-hidden="true"
            />
          ) : (
            <span
              className="absolute inset-0 z-0 bg-white/60 transition-opacity dark:bg-white/[0.03]"
              aria-hidden="true"
            />
          )}
        </MenuButton>
        <Transition
          show={isOpen}
          enter="transition-all ease-out duration-300"
          enterFrom="opacity-0 scale-95 translate-y-[-10px]"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="transition-all ease-in duration-200"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-[10px]"
        >
          <MenuItems
            as="div"
            className="absolute right-0 z-50 mt-3 w-52 origin-top-right rounded-2xl border border-gray-200/80 bg-white/90 shadow-glow backdrop-blur-lg focus:outline-none dark:border-white/10 dark:bg-gray-900/80"
          >
            <RadioGroup>
              <div className="p-2">
                {authors.map((author) => author.language === locale && renderAuthorLink(author))}
              </div>
            </RadioGroup>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  ) : (
    <div className={className}>
      {mainAuthor.map((author) => {
        const { name, slug } = author
        return (
          <Link
            href={`/${locale}/about/${slug}`}
            key={name}
            className={`relative hidden overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition-colors sm:flex ${
              isSelected
                ? 'border-transparent text-white'
                : 'border-gray-200/70 text-gray-600 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            <span className="relative z-10">{t('about')}</span>
            {isSelected ? (
              <motion.span
                layoutId="author-tab"
                transition={{ type: 'spring', duration: 0.45 }}
                className="absolute inset-0 z-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-90"
                aria-hidden="true"
              />
            ) : (
              <span
                className="absolute inset-0 z-0 bg-white/70 dark:bg-white/[0.03]"
                aria-hidden="true"
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default AuthorsMenu

import React, { type ReactNode } from 'react'

interface SectionContainerProps {
  children: ReactNode
}

export default function SectionContainer({ children }: SectionContainerProps): React.JSX.Element {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      {children}
    </section>
  )
}

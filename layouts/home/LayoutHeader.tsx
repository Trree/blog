import React from 'react'

interface LayoutHeaderProps {
  title: string
  description?: string
}

const LayoutHeader: React.FC<LayoutHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
        <span className="h-px w-12 bg-gradient-to-r from-primary-500 to-accent-400" />
        <span>{title}</span>
      </div>
      {description ? (
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{description}</p>
      ) : null}
    </div>
  )
}

export default LayoutHeader

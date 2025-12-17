'use client'

import { useState, useMemo } from 'react'
import GraphViewCanvas from '@/components/graph/GraphViewCanvas'
import { filterGraphByTag, type GraphData } from '@/lib/graph-utils'
import type { LocaleTypes } from '../../i18n/settings'

interface GraphCanvasWrapperProps {
  graphData: GraphData
  locale: LocaleTypes
}

export default function GraphCanvasWrapper({ graphData, locale }: GraphCanvasWrapperProps) {
  const [selectedTag, setSelectedTag] = useState<string>('')

  // 获取所有唯一标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    graphData.nodes.forEach((node) => {
      node.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [graphData])

  // 根据选中的标签过滤图谱数据
  const filteredGraphData = useMemo(() => {
    if (!selectedTag) return graphData
    return filterGraphByTag(graphData, selectedTag)
  }, [graphData, selectedTag])

  return (
    <div className="space-y-4">
      {/* 标签过滤器 - 极简版 */}
      {allTags.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTag('')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedTag === ''
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {locale === 'zh' ? '全部' : 'All'}
              </button>
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTag && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {locale === 'zh' ? `筛选: ${selectedTag}` : `Filter: ${selectedTag}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas 图谱视图 */}
      <GraphViewCanvas graphData={filteredGraphData} />

      {/* 简洁提示 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="px-4 py-3">
          <div className="grid gap-2 text-xs md:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {locale === 'zh' ? '单击选择，双击查看' : 'Click select, double-click view'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {locale === 'zh' ? '拖拽画布，滚动缩放' : 'Drag pan, scroll zoom'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {locale === 'zh' ? 'D3 + Canvas 高性能' : 'D3 + Canvas optimized'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

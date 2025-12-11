'use client'

import { useState, useMemo } from 'react'
import GraphView from '@/components/graph/GraphView'
import { filterGraphByTag, type GraphData } from '@/lib/graph-utils'
import type { LocaleTypes } from '../../i18n/settings'

interface GraphClientWrapperProps {
  graphData: GraphData
  locale: LocaleTypes
}

type LayoutMode = 'forceAtlas2Based' | 'barnesHut' | 'hierarchicalRepulsion'

export default function GraphClientWrapper({ graphData, locale }: GraphClientWrapperProps) {
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('barnesHut')
  const [physicsEnabled, setPhysicsEnabled] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const [forceStrength, setForceStrength] = useState(-13)

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

  // 布局模式选项
  const layoutOptions = [
    {
      value: 'forceAtlas2Based' as LayoutMode,
      label: locale === 'zh' ? 'Force Atlas' : 'Force Atlas',
      description: locale === 'zh' ? '力导向算法' : 'Force-directed',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
        </svg>
      ),
    },
    {
      value: 'barnesHut' as LayoutMode,
      label: locale === 'zh' ? 'Barnes-Hut' : 'Barnes-Hut',
      description: locale === 'zh' ? '自动力导向' : 'Auto force layout',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      value: 'hierarchicalRepulsion' as LayoutMode,
      label: locale === 'zh' ? '层级' : 'Hierarchical',
      description: locale === 'zh' ? '分层显示' : 'Layered',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* 面板头部 - 带快捷操作 */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <svg
                className="text-primary-500 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              {locale === 'zh' ? '图谱控制' : 'Graph Controls'}
            </h3>
            <button
              onClick={() => setShowControls(!showControls)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {showControls
                ? locale === 'zh'
                  ? '收起'
                  : 'Collapse'
                : locale === 'zh'
                  ? '展开'
                  : 'Expand'}
            </button>
          </div>

          {/* 力强度快捷控制 */}
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {locale === 'zh' ? '力强度' : 'Force Strength'}
              </label>
              <span className="text-primary-600 dark:text-primary-400 font-mono text-xs font-bold">
                {forceStrength.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="0.5"
              value={forceStrength}
              onChange={(e) => setForceStrength(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg"
              style={{
                background: `linear-gradient(to right,
                  rgb(239, 68, 68) 0%,
                  rgb(156, 163, 175) ${((forceStrength + 30) / 60) * 100}%,
                  rgb(156, 163, 175) ${((forceStrength + 30) / 60) * 100}%,
                  rgb(34, 197, 94) 100%)`,
              }}
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
              <span>{locale === 'zh' ? '排斥↔' : 'Repel↔'}</span>
              <span>{locale === 'zh' ? '↔吸引' : '↔Attract'}</span>
            </div>
          </div>

          {/* 快捷标签过滤 - 总是显示 */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTag('')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedTag === ''
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {locale === 'zh' ? '全部' : 'All'}
              </button>
              {allTags.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {allTags.length > 6 && (
                <button
                  onClick={() => setShowControls(true)}
                  className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  +{allTags.length - 6}
                </button>
              )}
            </div>
            {selectedTag ? (
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
            ) : null}
          </div>
        </div>

        {/* 面板内容 - 高级控制 */}
        {showControls ? (
          <div className="space-y-6 border-t border-gray-200/50 p-6 dark:border-gray-700/50">
            {/* 所有标签选择器 */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {locale === 'zh' ? '所有标签' : 'All Tags'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* 布局模式选择 */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                  />
                </svg>
                {locale === 'zh' ? '布局模式' : 'Layout Mode'}
              </label>
              <div className="flex flex-wrap gap-2">
                {layoutOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLayoutMode(option.value)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      layoutMode === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="h-4 w-4">{option.icon}</div>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* 力强度控制滑块 */}
            <div>
              <label className="mb-3 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {locale === 'zh' ? '力强度' : 'Force Strength'}
                </span>
                <span className="text-primary-600 dark:text-primary-400 font-mono text-xs">
                  {forceStrength.toFixed(2)}
                </span>
              </label>

              <div className="space-y-2">
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="0.5"
                  value={forceStrength}
                  onChange={(e) => setForceStrength(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                  style={{
                    background: `linear-gradient(to right,
                      rgb(239, 68, 68) 0%,
                      rgb(156, 163, 175) ${((forceStrength + 30) / 60) * 100}%,
                      rgb(156, 163, 175) ${((forceStrength + 30) / 60) * 100}%,
                      rgb(34, 197, 94) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{locale === 'zh' ? '排斥力' : 'Repulsion'} (-30)</span>
                  <span>0</span>
                  <span>{locale === 'zh' ? '吸引力' : 'Attraction'} (+30)</span>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {locale === 'zh'
                  ? '拖动滑块调整力的大小。负值表示排斥力（节点分散），正值表示吸引力（节点聚集）'
                  : 'Drag to adjust force. Negative = repulsion (spread), positive = attraction (cluster)'}
              </p>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* 物理引擎开关 */}
            <div>
              <label className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {locale === 'zh' ? '自动力导向' : 'Auto Force Layout'}
                </span>
                <button
                  onClick={() => setPhysicsEnabled(!physicsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    physicsEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                      physicsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {locale === 'zh'
                  ? '启用后节点会自动调整到最优位置，使用 Barnes-Hut 算法优化布局'
                  : 'Nodes automatically adjust to optimal positions using Barnes-Hut algorithm'}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* 图谱视图 */}
      <GraphView
        graphData={filteredGraphData}
        layoutMode={layoutMode}
        physicsEnabled={physicsEnabled}
        forceStrength={forceStrength}
      />

      {/* 图例说明 - 简洁卡片 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <svg
              className="text-primary-500 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {locale === 'zh' ? '图例说明' : 'Legend'}
          </h3>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg
              className={`h-5 w-5 transition-transform ${showLegend ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        {showLegend ? (
          <div className="grid gap-3 p-4 text-sm md:grid-cols-2">
            {[
              {
                title: locale === 'zh' ? '布局算法' : 'Layout Algorithm',
                desc: locale === 'zh' ? 'Barnes-Hut 自动力导向' : 'Barnes-Hut force-directed',
              },
              {
                title: locale === 'zh' ? '节点大小' : 'Node Size',
                desc: locale === 'zh' ? '标签数量越多节点越大' : 'More tags = larger nodes',
              },
              {
                title: locale === 'zh' ? '节点颜色' : 'Node Color',
                desc: locale === 'zh' ? '根据标签分组着色' : 'Colored by tag groups',
              },
              {
                title: locale === 'zh' ? '连线' : 'Edges',
                desc: locale === 'zh' ? '表示文章间的标签关联' : 'Shows tag relationships',
              },
              {
                title: locale === 'zh' ? '交互' : 'Interactions',
                desc:
                  locale === 'zh' ? '单击查看，双击跳转，拖拽移动' : 'Click, double-click, drag',
              },
              {
                title: locale === 'zh' ? '优化' : 'Optimization',
                desc: locale === 'zh' ? '自动避免节点重叠' : 'Auto overlap prevention',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="bg-primary-500 mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

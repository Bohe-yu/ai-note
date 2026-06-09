'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { FileText, Hash, TrendingUp } from 'lucide-react'

interface StatsData {
  totalCount: number
  tagCloud: { tag: string; count: number }[]
  weeklyData: { week: string; count: number }[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTagSize = (count: number, maxCount: number) => {
    const minSize = 12
    const maxSize = 24
    const ratio = count / maxCount
    return minSize + (maxSize - minSize) * ratio
  }

  const getTagColor = (index: number) => {
    const colors = ['#7C3AED', '#A855F7', '#C084FC', '#E879F9', '#F472B6']
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <h1 className="text-xl font-bold">统计数据</h1>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Total count */}
        <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-[#7C3AED]" />
            <div>
              <p className="text-sm text-gray-400">总笔记数</p>
              <p className="text-3xl font-bold">{stats?.totalCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Tag cloud */}
        <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Hash size={20} className="text-[#7C3AED]" />
            <h2 className="font-semibold">标签云</h2>
          </div>
          {stats?.tagCloud && stats.tagCloud.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {stats.tagCloud.map((item, index) => {
                const maxCount = Math.max(...stats.tagCloud.map(t => t.count))
                return (
                  <span
                    key={item.tag}
                    className="px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      fontSize: `${getTagSize(item.count, maxCount)}px`,
                      backgroundColor: getTagColor(index),
                    }}
                  >
                    {item.tag} ({item.count})
                  </span>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无标签数据</p>
          )}
        </div>

        {/* Weekly chart */}
        <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-[#7C3AED]" />
            <h2 className="font-semibold">每周笔记数</h2>
          </div>
          {stats?.weeklyData && stats.weeklyData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyData}>
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#333' }}
                  />
                  <YAxis
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#333' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#7C3AED" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无周数据</p>
          )}
        </div>
      </div>

      <nav className="flex border-t border-[#333]">
        <Link
          href="/"
          className="flex-1 p-4 text-center text-gray-400 hover:text-white transition-colors"
        >
          记录
        </Link>
        <Link
          href="/notes"
          className="flex-1 p-4 text-center text-gray-400 hover:text-white transition-colors"
        >
          笔记
        </Link>
        <Link
          href="/stats"
          className="flex-1 p-4 text-center text-[#7C3AED] font-semibold"
        >
          统计
        </Link>
      </nav>
    </div>
  )
}

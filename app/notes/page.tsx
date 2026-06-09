'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Tag, Clock, Trash2 } from 'lucide-react'
import type { Note } from '@/lib/types'

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    let filtered = notes

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedTag) {
      filtered = filtered.filter((note) => note.tags.includes(selectedTag))
    }

    setFilteredNotes(filtered)
  }, [notes, searchQuery, selectedTag])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      const data = await response.json()
      setNotes(data)
      setFilteredNotes(data)

      // Extract all unique tags
      const tags = new Set<string>()
      data.forEach((note: Note) => {
        note.tags.forEach((tag) => tags.add(tag))
      })
      setAllTags(Array.from(tags))
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    if (!confirm('确定删除这条笔记吗？')) return

    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      fetchNotes()
    } catch (error) {
      console.error('Failed to delete note:', error)
      alert('删除失败')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500'
      case 'ready':
        return 'bg-yellow-500'
      case 'published':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return '草稿'
      case 'ready':
        return '就绪'
      case 'published':
        return '已发布'
      default:
        return status
    }
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
        <h1 className="text-xl font-bold">我的笔记</h1>
        <Link href="/" className="text-[#7C3AED] hover:text-[#6D28D9]">
          新建笔记
        </Link>
      </header>

      <div className="p-4 space-y-4 overflow-auto flex-1">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg focus:outline-none focus:border-[#7C3AED] text-white placeholder-gray-500"
          />
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                !selectedTag ? 'bg-[#7C3AED] text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
                  selectedTag === tag ? 'bg-[#7C3AED] text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'
                }`}
              >
                <Tag size={12} />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Notes grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {notes.length === 0 ? '还没有笔记，去创建第一条吧！' : '没有找到匹配的笔记'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredNotes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 hover:border-[#7C3AED] transition-colors relative"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    deleteNote(note.id)
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                {note.image_urls && note.image_urls.length > 0 && (
                  <img
                    src={note.image_urls[0]}
                    alt="Note thumbnail"
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}

                <p className="text-sm text-gray-300 mb-2 line-clamp-2">{note.summary}</p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-[#333] rounded-full text-gray-400">
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-[#333] rounded-full text-gray-400">
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(note.created_at).toLocaleDateString('zh-CN')}
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-white text-xs ${getStatusColor(note.status)}`}>
                    {getStatusText(note.status)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
          className="flex-1 p-4 text-center text-[#7C3AED] font-semibold"
        >
          笔记
        </Link>
        <Link
          href="/stats"
          className="flex-1 p-4 text-center text-gray-400 hover:text-white transition-colors"
        >
          统计
        </Link>
      </nav>
    </div>
  )
}

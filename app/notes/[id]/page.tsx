'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Copy, Sparkles, Check, X } from 'lucide-react'
import type { Note, NoteStatus } from '@/lib/types'

export default function NoteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [note, setNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)
  const [expandedPost, setExpandedPost] = useState<{ title: string; body: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNote()
  }, [params.id])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}`)
      const data = await response.json()
      setNote(data)
      setEditedContent(data.content)
    } catch (error) {
      console.error('Failed to fetch note:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!note) return

    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      })
      setNote({ ...note, content: editedContent })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save note:', error)
      alert('保存失败')
    }
  }

  const handleStatusChange = async (newStatus: NoteStatus) => {
    if (!note) return

    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setNote({ ...note, status: newStatus })
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('更新失败')
    }
  }

  const handleDelete = async () => {
    if (!note || !confirm('确定删除这条笔记吗？')) return

    try {
      await fetch(`/api/notes/${note.id}`, { method: 'DELETE' })
      router.push('/notes')
    } catch (error) {
      console.error('Failed to delete note:', error)
      alert('删除失败')
    }
  }

  const handleExpandToPost = async () => {
    if (!note) return

    setIsExpanding(true)
    try {
      const response = await fetch(`/api/notes/${note.id}/expand`, {
        method: 'POST',
      })
      const data = await response.json()
      setExpandedPost(data)
    } catch (error) {
      console.error('Failed to expand note:', error)
      alert('生成失败')
    } finally {
      setIsExpanding(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
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

  if (!note) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">笔记不存在</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <Link href="/notes" className="text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Status toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">状态:</span>
          <div className="flex gap-2">
            {(['draft', 'ready', 'published'] as NoteStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1 rounded-full text-sm ${
                  note.status === status
                    ? `${getStatusColor(status)} text-white`
                    : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-[#7C3AED] rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* Summary */}
        <div className="p-3 bg-[#1a1a1a] border border-[#333] rounded-lg">
          <p className="text-sm text-gray-300">{note.summary}</p>
        </div>

        {/* Images */}
        {note.image_urls && note.image_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {note.image_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Note image ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">内容</h2>
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-green-500 hover:text-green-400"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedContent(note.content)
                  }}
                  className="p-1 text-red-500 hover:text-red-400"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#333] rounded-lg resize-none focus:outline-none focus:border-[#7C3AED] text-white min-h-[200px]"
            />
          ) : (
            <div className="p-3 bg-[#1a1a1a] border border-[#333] rounded-lg whitespace-pre-wrap">
              {note.content}
            </div>
          )}
        </div>

        {/* Source URL */}
        {note.source_url && (
          <div className="p-3 bg-[#1a1a1a] border border-[#333] rounded-lg">
            <p className="text-sm text-gray-400 mb-1">来源:</p>
            <a
              href={note.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#7C3AED] hover:text-[#6D28D9] break-all"
            >
              {note.source_url}
            </a>
          </div>
        )}

        {/* Expand to Post */}
        <button
          onClick={handleExpandToPost}
          disabled={isExpanding}
          className="w-full p-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#333] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          {isExpanding ? '生成中...' : '扩展为小红书帖子'}
        </button>

        {/* Expanded Post Result */}
        {expandedPost && (
          <div className="space-y-3 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#7C3AED]">生成的帖子</h3>
              <button
                onClick={() => copyToClipboard(`${expandedPost.title}\n\n${expandedPost.body}`)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <Copy size={16} />
              </button>
            </div>
            <div className="p-3 bg-black border border-[#333] rounded-lg">
              <h4 className="font-bold mb-2">{expandedPost.title}</h4>
              <p className="whitespace-pre-wrap text-sm text-gray-300">{expandedPost.body}</p>
            </div>
          </div>
        )}

        {/* Created at */}
        <div className="text-xs text-gray-500 text-center">
          创建于 {new Date(note.created_at).toLocaleString('zh-CN')}
        </div>
      </div>
    </div>
  )
}

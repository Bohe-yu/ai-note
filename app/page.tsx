'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Image as ImageIcon, Link2, X } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || images.length + files.length > 3) {
      alert('最多上传3张图片')
      return
    }

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        if (data.url) {
          setImages([...images, data.url])
        }
      } catch (error) {
        console.error('Upload failed:', error)
        alert('图片上传失败')
      }
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('请输入内容')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          image_urls: images,
          source_url: sourceUrl || undefined,
        }),
      })

      if (response.ok) {
        setContent('')
        setImages([])
        setSourceUrl('')
        router.push('/notes')
      } else {
        alert('保存失败')
      }
    } catch (error) {
      console.error('Submit failed:', error)
      alert('保存失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b border-[#333]">
        <h1 className="text-xl font-bold">AI Note</h1>
        <Link href="/notes" className="text-[#7C3AED] hover:text-[#6D28D9]">
          查看笔记
        </Link>
      </header>

      <main className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="输入你的想法..."
          className="flex-1 w-full p-4 bg-[#1a1a1a] border border-[#333] rounded-lg resize-none focus:outline-none focus:border-[#7C3AED] text-white placeholder-gray-500"
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="来源链接 (可选)"
            className="flex-1 p-3 bg-[#1a1a1a] border border-[#333] rounded-lg focus:outline-none focus:border-[#7C3AED] text-white placeholder-gray-500"
          />
        </div>

        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#1a1a1a] border border-[#333] rounded-lg cursor-pointer hover:border-[#7C3AED] transition-colors">
            <ImageIcon size={20} />
            <span>添加图片 ({images.length}/3)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full p-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#333] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          {isSubmitting ? '保存中...' : '保存并AI处理'}
        </button>
      </main>

      <nav className="flex border-t border-[#333]">
        <Link
          href="/"
          className="flex-1 p-4 text-center text-[#7C3AED] font-semibold"
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
          className="flex-1 p-4 text-center text-gray-400 hover:text-white transition-colors"
        >
          统计
        </Link>
      </nav>
    </div>
  )
}

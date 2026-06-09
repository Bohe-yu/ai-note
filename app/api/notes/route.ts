import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateTagsAndSummary } from '@/lib/anthropic'
import type { CreateNoteInput } from '@/lib/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')

  let query = supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (search) {
    query = query.or(`content.ilike.%${search}%,tags.cs.{${search}}`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateNoteInput = await request.json()
    const { content, image_urls = [], source_url, title } = body

    // Generate tags and summary using AI
    const aiResult = await generateTagsAndSummary(content)

    // Fetch title from URL if provided and no title given
    let finalTitle = title || ''
    if (source_url && !finalTitle) {
      try {
        const response = await fetch(source_url)
        const html = await response.text()
        const titleMatch = html.match(/<title>(.*?)<\/title>/i)
        if (titleMatch) {
          finalTitle = titleMatch[1]
        }
      } catch (e) {
        console.error('Failed to fetch URL title:', e)
      }
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: finalTitle,
        content,
        image_urls,
        tags: aiResult.tags,
        summary: aiResult.summary,
        source_url,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create note' },
      { status: 500 }
    )
  }
}

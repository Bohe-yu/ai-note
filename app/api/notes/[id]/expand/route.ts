import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { expandToPost } from '@/lib/anthropic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get the note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 })
    }

    // Expand to post using AI
    const post = await expandToPost(note.content)

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to expand note' },
      { status: 500 }
    )
  }
}

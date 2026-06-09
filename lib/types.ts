export type NoteStatus = 'draft' | 'ready' | 'published'

export interface Note {
  id: string
  title: string
  content: string
  image_urls: string[]
  tags: string[]
  summary: string
  source_url?: string
  status: NoteStatus
  created_at: string
  updated_at: string
}

export interface CreateNoteInput {
  title?: string
  content: string
  image_urls?: string[]
  source_url?: string
}

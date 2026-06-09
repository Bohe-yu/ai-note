import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Get total count
  const { count: totalCount } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })

  // Get all notes for tag cloud and weekly stats
  const { data: notes } = await supabase
    .from('notes')
    .select('tags, created_at')
    .order('created_at', { ascending: false })

  // Calculate tag frequencies
  const tagFreq: Record<string, number> = {}
  notes?.forEach(note => {
    note.tags.forEach((tag: string) => {
      tagFreq[tag] = (tagFreq[tag] || 0) + 1
    })
  })

  const tagCloud = Object.entries(tagFreq)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)

  // Calculate weekly stats (last 8 weeks)
  const weeklyStats: Record<string, number> = {}
  const now = new Date()
  
  notes?.forEach(note => {
    const noteDate = new Date(note.created_at)
    const weeksAgo = Math.floor((now.getTime() - noteDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    if (weeksAgo < 8) {
      const weekKey = `${weeksAgo}周前`
      weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1
    }
  })

  const weeklyData = Object.entries(weeklyStats)
    .map(([week, count]) => ({ week, count }))
    .reverse()

  return NextResponse.json({
    totalCount: totalCount || 0,
    tagCloud,
    weeklyData,
  })
}

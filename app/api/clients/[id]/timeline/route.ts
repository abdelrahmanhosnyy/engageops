import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const [{ data: tasks }, { data: meetings }, { data: achievements }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, title, status, created_at, updated_at')
        .eq('client_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),

      supabase
        .from('meetings')
        .select('id, title, meeting_date, created_at')
        .eq('client_id', id)
        .is('deleted_at', null)
        .order('meeting_date', { ascending: false }),

      supabase
        .from('achievements')
        .select('id, title, achievement_date, created_at')
        .eq('client_id', id)
        .is('deleted_at', null)
        .order('achievement_date', { ascending: false }),
    ])

  // Merge into unified timeline
  const entries = [
    ...(tasks || []).map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      subtitle: t.status,
      date: t.created_at,
      href: `/tasks/${t.id}`,
    })),
    ...(meetings || []).map(m => ({
      id: m.id,
      type: 'meeting' as const,
      title: m.title,
      subtitle: 'Meeting',
      date: m.meeting_date,
      href: `/meetings/${m.id}`,
    })),
    ...(achievements || []).map(a => ({
      id: a.id,
      type: 'achievement' as const,
      title: a.title,
      subtitle: 'Achievement',
      date: a.achievement_date,
      href: `/achievements/${a.id}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({ data: entries })
}
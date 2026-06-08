import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) return NextResponse.json({ data: [] })

  const [{ data: clients }, { data: tasks }, { data: meetings }, { data: achievements }] =
    await Promise.all([
      supabase.from('clients').select('id, name').is('deleted_at', null).ilike('name', `%${q}%`).limit(3),
      supabase.from('tasks').select('id, title, client:clients(name)').is('deleted_at', null).ilike('title', `%${q}%`).limit(5),
      supabase.from('meetings').select('id, title, client:clients(name)').is('deleted_at', null).ilike('title', `%${q}%`).limit(3),
      supabase.from('achievements').select('id, title, client:clients(name)').is('deleted_at', null).ilike('title', `%${q}%`).limit(3),
    ])

  const results = [
    ...(clients || []).map((c: any) => ({
      id: c.id, type: 'client', title: c.name, subtitle: 'Client', href: `/clients/${c.id}`,
    })),
    ...(tasks || []).map((t: any) => ({
      id: t.id, type: 'task', title: t.title, subtitle: t.client?.name || 'Task', href: `/tasks/${t.id}`,
    })),
    ...(meetings || []).map((m: any) => ({
      id: m.id, type: 'meeting', title: m.title, subtitle: m.client?.name || 'Meeting', href: `/meetings/${m.id}`,
    })),
    ...(achievements || []).map((a: any) => ({
      id: a.id, type: 'achievement', title: a.title, subtitle: a.client?.name || 'Achievement', href: `/achievements/${a.id}`,
    })),
  ]

  return NextResponse.json({ data: results })
}
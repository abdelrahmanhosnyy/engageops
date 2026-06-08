import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'weekly' or 'monthly'
  const date = searchParams.get('date') // ISO date string

  if (!type || !date) {
    return NextResponse.json({ error: 'type and date are required' }, { status: 400 })
  }

  const refDate = new Date(date)
  let start: Date
  let end: Date

  if (type === 'weekly') {
    start = startOfWeek(refDate, { weekStartsOn: 0 })
    end = endOfWeek(refDate, { weekStartsOn: 0 })
  } else {
    start = startOfMonth(refDate)
    end = endOfMonth(refDate)
  }

  // Get all active clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')

  if (!clients) return NextResponse.json({ data: [] })

  // For each client, get completed tasks and achievements in range
  const report = await Promise.all(
    clients.map(async (client) => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, updated_at')
        .eq('client_id', client.id)
        .eq('status', 'Done')
        .is('deleted_at', null)
        .gte('updated_at', start.toISOString())
        .lte('updated_at', end.toISOString())
        .order('updated_at', { ascending: false })

      const { data: achievements } = await supabase
        .from('achievements')
        .select('id, title, achievement_date')
        .eq('client_id', client.id)
        .is('deleted_at', null)
        .gte('achievement_date', start.toISOString().split('T')[0])
        .lte('achievement_date', end.toISOString().split('T')[0])
        .order('achievement_date', { ascending: false })

      return {
        client,
        tasks: tasks || [],
        achievements: achievements || [],
      }
    })
  )

  // Only return clients that have activity
  const filtered = report.filter(r => r.tasks.length > 0 || r.achievements.length > 0)

  return NextResponse.json({ data: filtered, start, end })
}
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: myTasks } = await supabase
    .from('tasks')
    .select('*, client:clients(id, name), updates:task_updates(id, content, created_at)')
    .is('deleted_at', null)
    .is('archived_at', null)
    .in('status', ['Not Started', 'In Progress'])
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(10)

  const { data: waitingTasks } = await supabase
    .from('tasks')
    .select('*, client:clients(id, name), updates:task_updates(id, content, created_at)')
    .is('deleted_at', null)
    .is('archived_at', null)
    .eq('status', 'Waiting for Client')
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(10)

  const { data: recentMeetings } = await supabase
    .from('meetings')
    .select('*, client:clients(id, name)')
    .is('deleted_at', null)
    .order('meeting_date', { ascending: false })
    .limit(5)

  const { data: recentAchievements } = await supabase
    .from('achievements')
    .select('*, client:clients(id, name)')
    .is('deleted_at', null)
    .order('achievement_date', { ascending: false })
    .limit(5)

  return NextResponse.json({
    data: {
      myTasks: myTasks || [],
      waitingTasks: waitingTasks || [],
      recentMeetings: recentMeetings || [],
      recentAchievements: recentAchievements || [],
    }
  })
}
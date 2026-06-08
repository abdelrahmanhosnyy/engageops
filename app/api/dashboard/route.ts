import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // My active tasks (Not Started + In Progress, owner = Me)
  const { data: myTasks } = await supabase
    .from('tasks')
    .select('*, client:clients(id, name)')
    .is('deleted_at', null)
    .in('status', ['Not Started', 'In Progress'])
    .eq('owner', 'Me')
    .order('updated_at', { ascending: false })
    .limit(10)

  // Waiting for client tasks
  const { data: waitingTasks } = await supabase
    .from('tasks')
    .select('*, client:clients(id, name)')
    .is('deleted_at', null)
    .eq('status', 'Waiting for Client')
    .order('updated_at', { ascending: false })
    .limit(10)

  // Recent meetings
  const { data: recentMeetings } = await supabase
    .from('meetings')
    .select('*, client:clients(id, name)')
    .is('deleted_at', null)
    .order('meeting_date', { ascending: false })
    .limit(5)

  // Recent achievements
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
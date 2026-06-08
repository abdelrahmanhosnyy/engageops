import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meetings')
    .select('*, client:clients(id, name)')
    .is('deleted_at', null)
    .order('meeting_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!body.client_id) {
    return NextResponse.json({ error: 'Client is required' }, { status: 400 })
  }

  // 1. Create the meeting
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      client_id: body.client_id,
      title: body.title.trim(),
      notes: body.notes || null,
      meeting_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (meetingError) {
    return NextResponse.json({ error: meetingError.message }, { status: 500 })
  }

  // 2. Insert action items and auto-create tasks
  if (body.action_items?.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from('meeting_action_items')
      .insert(
        body.action_items
          .filter((i: any) => i.title?.trim())
          .map((i: any) => ({
            meeting_id: meeting.id,
            title: i.title.trim(),
            owner: i.owner || 'Me',
            due_date: i.due_date || null,
          }))
      )
      .select()

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // 3. Auto-create a task for every action item
    if (items && items.length > 0) {
      await supabase.from('tasks').insert(
        items.map((item: any) => ({
          client_id: body.client_id,
          meeting_action_item_id: item.id,
          title: item.title,
          owner: item.owner,
          due_date: item.due_date || null,
          status: 'Not Started',
        }))
      )
    }
  }

  return NextResponse.json({ data: meeting }, { status: 201 })
}
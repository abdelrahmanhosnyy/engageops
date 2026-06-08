import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/tasks/:id — single task with updates and attachments
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:clients(id, name),
      updates:task_updates(
        *,
        attachments:task_attachments(*)
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

// PATCH /api/tasks/:id — update task
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const body = await request.json()
  const { id } = await params

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: body.title,
      owner: body.owner,
      description: body.description,
      status: body.status,
      due_date: body.due_date,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/tasks/:id — soft delete
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const client_id = searchParams.get('client_id')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const archived = searchParams.get('archived') === 'true'

  let query = supabase
    .from('tasks')
    .select(`
      *,
      client:clients(id, name),
      updates:task_updates(id, content, created_at)
    `)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (archived) {
    query = query.not('archived_at', 'is', null)
  } else {
    query = query.is('archived_at', null)
  }

  if (client_id) query = query.eq('client_id', client_id)
  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
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

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      client_id: body.client_id,
      title: body.title.trim(),
      owner: body.owner || '',
      description: body.description || null,
      status: body.status || 'Not Started',
      due_date: body.due_date || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
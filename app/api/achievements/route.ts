import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('achievements')
    .select('*, client:clients(id, name)')
    .is('deleted_at', null)
    .order('achievement_date', { ascending: false })

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
  if (!body.achievement_date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('achievements')
    .insert({
      client_id: body.client_id,
      title: body.title.trim(),
      description: body.description || null,
      comments: body.comments || null,
      achievement_date: body.achievement_date,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
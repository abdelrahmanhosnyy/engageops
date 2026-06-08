import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/clients — list all active clients
export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/clients — create a new client
export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ name: body.name.trim(), notes: body.notes || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
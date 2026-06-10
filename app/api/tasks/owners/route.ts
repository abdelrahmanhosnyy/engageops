import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('owner')
    .is('deleted_at', null)
    .not('owner', 'eq', '')
    .not('owner', 'is', null)

  if (error) return NextResponse.json({ data: [] })

  const unique = [...new Set((data || []).map(t => t.owner).filter(Boolean))]
  return NextResponse.json({ data: unique })
}
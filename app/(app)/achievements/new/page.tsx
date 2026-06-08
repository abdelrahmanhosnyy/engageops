'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function NewAchievementPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [comments, setComments] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(({ data }) => setClients(data || []))
  }, [])

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return }
    if (!clientId) { setError('Please select a client'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        client_id: clientId,
        description,
        comments,
        achievement_date: date,
      }),
    })

    const { data, error } = await res.json()
    if (error) { setError(error); setLoading(false); return }
    router.push(`/achievements/${data.id}`)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/achievements" className="text-sm text-slate-400 hover:text-slate-600">
          ← Achievements
        </Link>
        <h1 className="text-2xl font-semibold text-[#0F172A] mt-2">New Achievement</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Client *</Label>
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
          >
            <option value="">Select a client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input
            placeholder="e.g. Push CVR improved by 18%"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Date *</Label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            placeholder="What was achieved and how..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Comments</Label>
          <Textarea
            placeholder="Internal notes, context, next steps..."
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={2}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button
            className="bg-[#2563EB] hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Achievement'}
          </Button>
          <Link href="/achievements">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
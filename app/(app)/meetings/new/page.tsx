'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ActionItemDraft = {
  id: number
  title: string
  owner: string
}

export default function NewMeetingPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [actionItems, setActionItems] = useState<ActionItemDraft[]>([
    { id: 1, title: '', owner: 'Me' }
  ])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(({ data }) => setClients(data || []))
  }, [])

  function addActionItem() {
    setActionItems(prev => [
      ...prev,
      { id: Date.now(), title: '', owner: 'Me' }
    ])
  }

  function removeActionItem(id: number) {
    setActionItems(prev => prev.filter(i => i.id !== id))
  }

  function updateActionItem(id: number, field: string, value: string) {
    setActionItems(prev =>
      prev.map(i => i.id === id ? { ...i, [field]: value } : i)
    )
  }

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return }
    if (!clientId) { setError('Please select a client'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        client_id: clientId,
        notes,
        action_items: actionItems.filter(i => i.title.trim()),
      }),
    })

    const { data, error } = await res.json()
    if (error) { setError(error); setLoading(false); return }
    router.push(`/meetings/${data.id}`)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/meetings" className="text-sm text-slate-400 hover:text-slate-600">
          ← Meetings
        </Link>
        <h1 className="text-2xl font-semibold text-[#0F172A] mt-2">New Meeting</h1>
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
          <Label>Meeting Title *</Label>
          <Input
            placeholder="e.g. Monthly Retention Review"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            placeholder="What was discussed..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Action Items */}
        <div className="space-y-2">
          <Label>Action Items</Label>
          {actionItems.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-center">
              <Input
                placeholder={`Action item ${index + 1}`}
                value={item.title}
                onChange={e => updateActionItem(item.id, 'title', e.target.value)}
                className="flex-1"
              />
              <select
                value={item.owner}
                onChange={e => updateActionItem(item.id, 'owner', e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 bg-white"
              >
                <option value="Me">Me</option>
                <option value="Client">Client</option>
              </select>
              {actionItems.length > 1 && (
                <button
                  onClick={() => removeActionItem(item.id)}
                  className="text-slate-300 hover:text-red-400 text-lg leading-none"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addActionItem}
            className="text-sm text-[#2563EB] hover:underline mt-1"
          >
            + Add action item
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button
            className="bg-[#2563EB] hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Meeting'}
          </Button>
          <Link href="/meetings">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
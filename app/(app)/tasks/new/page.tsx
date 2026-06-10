'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client, TaskStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function NewTaskPage() {
  const router = useRouter()
const [clients, setClients] = useState<Client[]>([])
const [title, setTitle] = useState('')
const [clientId, setClientId] = useState('')
const [owner, setOwner] = useState('')
const [ownerSuggestions, setOwnerSuggestions] = useState<string[]>([])
const [showSuggestions, setShowSuggestions] = useState(false)
const [description, setDescription] = useState('')
const [status, setStatus] = useState<TaskStatus>('Not Started')
const [dueDate, setDueDate] = useState('')
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(({ data }) => setClients(data || []))
      fetch('/api/tasks/owners')
  .then(r => r.json())
  .then(({ data }) => setOwnerSuggestions(data || []))
  }, [])

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return }
    if (!clientId) { setError('Please select a client'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, client_id: clientId, owner, description, status, due_date: dueDate || null }),
    })

    const { data, error } = await res.json()
    if (error) { setError(error); setLoading(false); return }
    router.push(`/tasks/${data.id}`)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/tasks" className="text-sm text-slate-400 hover:text-slate-600">← Tasks</Link>
        <h1 className="text-2xl font-semibold text-[#0F172A] mt-2">New Task</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input placeholder="e.g. Analyze retention drop" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

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

      <div className="space-y-1.5 relative">
  <Label>Pending On</Label>
  <Input
    placeholder="e.g. Ahmed, Client, Dev team"
    value={owner}
onChange={e => { setOwner(e.target.value); setShowSuggestions(true) }}    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
  />
  {showSuggestions && ownerSuggestions.filter(s =>
    s.toLowerCase().includes(owner.toLowerCase()) && s !== owner
  ).length > 0 && (
    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
      {ownerSuggestions
        .filter(s => s.toLowerCase().includes(owner.toLowerCase()) && s !== owner)
        .map(s => (
          <button
            key={s}
onMouseDown={() => { setOwner(s); setShowSuggestions(false) }}            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {s}
          </button>
        ))}
    </div>
  )}
</div>

        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Additional context..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button className="bg-[#2563EB] hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
          <Link href="/tasks"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    </div>
  )
}
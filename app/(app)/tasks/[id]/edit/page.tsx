'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client, TaskStatus, TaskOwner } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function EditTaskPage() {
  const { id } = useParams()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [owner, setOwner] = useState<TaskOwner>('Me')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('Not Started')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch(`/api/tasks/${id}`).then(r => r.json()),
    ]).then(([clientsRes, taskRes]) => {
      setClients(clientsRes.data || [])
      const t = taskRes.data
      setTitle(t.title)
      setClientId(t.client_id)
      setOwner(t.owner)
      setDescription(t.description || '')
      setStatus(t.status)
      setDueDate(t.due_date || '')
    })
  }, [id])

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, owner, description, status, due_date: dueDate || null }),
    })

    const { error } = await res.json()
    if (error) { setError(error); setLoading(false); return }
    router.push(`/tasks/${id}`)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href={`/tasks/${id}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-[#0F172A] mt-2">Edit Task</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <select
              value={owner}
              onChange={e => setOwner(e.target.value as TaskOwner)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
            >
              <option value="Me">Me</option>
              <option value="Client">Client</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
            >
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Waiting for Client</option>
              <option>Done</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button
            className="bg-[#2563EB] hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Link href={`/tasks/${id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
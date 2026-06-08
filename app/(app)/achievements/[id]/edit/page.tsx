'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function EditAchievementPage() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [comments, setComments] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/achievements/${id}`)
      .then(r => r.json())
      .then(({ data }) => {
        setTitle(data.title)
        setDescription(data.description || '')
        setComments(data.comments || '')
        setDate(data.achievement_date)
      })
  }, [id])

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/achievements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, comments, achievement_date: date }),
    })

    const { error } = await res.json()
    if (error) { setError(error); setLoading(false); return }
    router.push(`/achievements/${id}`)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href={`/achievements/${id}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-[#0F172A] mt-2">Edit Achievement</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Date *</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>Comments</Label>
          <Textarea value={comments} onChange={e => setComments(e.target.value)} rows={2} />
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
          <Link href={`/achievements/${id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
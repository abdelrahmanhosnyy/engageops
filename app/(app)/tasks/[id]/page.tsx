'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Task, TaskStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge'
import { formatDistanceToNow, format } from 'date-fns'

const STATUS_OPTIONS: TaskStatus[] = [
  'Not Started', 'In Progress', 'Waiting for Client', 'Done'
]

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateText, setUpdateText] = useState('')
  const [posting, setPosting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function loadTask() {
    const res = await fetch(`/api/tasks/${id}`)
    const { data } = await res.json()
    setTask(data)
    setLoading(false)
  }

  useEffect(() => { loadTask() }, [id])

  async function handleStatusChange(newStatus: TaskStatus) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    loadTask()
  }

  async function handlePostUpdate() {
    if (!updateText.trim()) return
    setPosting(true)

    await fetch(`/api/tasks/${id}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: updateText }),
    })

    setUpdateText('')
    setPosting(false)
    loadTask()
  }

  async function handleDelete() {
    if (!confirm(`Delete this task?`)) return
    setDeleting(true)
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    router.push('/tasks')
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>
  if (!task) return <div className="p-8 text-slate-400">Task not found.</div>

  const updates = (task as any).updates || []

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/tasks" className="text-sm text-slate-400 hover:text-slate-600">← Tasks</Link>
        <div className="flex items-start justify-between mt-2 gap-4">
          <h1 className="text-2xl font-semibold text-[#0F172A]">{task.title}</h1>
         <Link href={`/tasks/${id}/edit`}>
  <Button variant="outline" size="sm">Edit</Button>
</Link>
<Button
  variant="outline"
  size="sm"
  className="text-red-600 hover:text-red-700 border-red-200 shrink-0"
  onClick={handleDelete}
  disabled={deleting}
>
  Delete
</Button>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Client</p>
            <p className="font-medium text-[#0F172A]">{task.client?.name}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Owner</p>
            <p className="font-medium text-[#0F172A]">{task.owner}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Status</p>
            <select
              value={task.status}
              onChange={e => handleStatusChange(e.target.value as TaskStatus)}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 bg-white"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Due Date</p>
            <p className="font-medium text-[#0F172A]">
              {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '—'}
            </p>
          </div>
        </div>
        {task.description && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-slate-400 text-sm mb-1">Description</p>
            <p className="text-sm text-[#0F172A]">{task.description}</p>
          </div>
        )}
      </div>

      {/* Activity */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-[#0F172A] mb-4">Activity</h2>

        {updates.length === 0 && (
          <p className="text-sm text-slate-400">No updates yet.</p>
        )}

        <div className="space-y-4">
          {[...updates].reverse().map((update: any) => (
            <div key={update.id} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
              <div>
                <p className="text-sm text-[#0F172A]">{update.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update composer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-medium text-[#0F172A] mb-3">Add Update</h2>
        <Textarea
          placeholder="What's the latest on this task?"
          value={updateText}
          onChange={e => setUpdateText(e.target.value)}
          rows={3}
          className="mb-3"
        />
        <Button
          className="bg-[#2563EB] hover:bg-blue-700 text-white"
          onClick={handlePostUpdate}
          disabled={posting || !updateText.trim()}
        >
          {posting ? 'Posting...' : 'Post Update'}
        </Button>
      </div>
    </div>
  )
}
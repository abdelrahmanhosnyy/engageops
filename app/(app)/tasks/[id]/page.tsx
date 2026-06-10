'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Task, TaskStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [dueDateEditing, setDueDateEditing] = useState(false)
  const [ownerSuggestions, setOwnerSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const dueDateRef = useRef<HTMLInputElement>(null)

  async function loadTask() {
    const res = await fetch(`/api/tasks/${id}`)
    const { data } = await res.json()
    setTask(data)
    setLoading(false)
  }

  useEffect(() => {
    loadTask()
    fetch('/api/tasks/owners')
      .then(r => r.json())
      .then(({ data }) => setOwnerSuggestions(data || []))
  }, [id])

  async function handleStatusChange(newStatus: TaskStatus) {
    if (newStatus === 'Done') {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Done',
          archived_at: new Date().toISOString()
        }),
      })
      router.push('/tasks')
      return
    }
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    loadTask()
  }

  async function handleDueDateChange(newDate: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_date: newDate || null }),
    })
    setDueDateEditing(false)
    loadTask()
  }

  async function handleOwnerChange(newOwner: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner: newOwner }),
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

  async function handleEditUpdate(updateId: string) {
    if (!editingContent.trim()) return
    await fetch(`/api/tasks/${id}/updates/${updateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editingContent }),
    })
    setEditingUpdateId(null)
    loadTask()
  }

  async function handleDeleteUpdate(updateId: string) {
    if (!confirm('Delete this update?')) return
    await fetch(`/api/tasks/${id}/updates/${updateId}`, { method: 'DELETE' })
    loadTask()
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    router.push('/tasks')
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>
  if (!task) return <div className="p-8 text-slate-400">Task not found.</div>

  const updates = (task as any).updates || []
  const filteredSuggestions = ownerSuggestions.filter(s =>
    s.toLowerCase().includes((task.owner || '').toLowerCase()) && s !== task.owner
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/tasks" className="text-sm text-slate-400 hover:text-slate-600">← Tasks</Link>
        <div className="flex items-start justify-between mt-2 gap-4">
          <h1 className="text-2xl font-semibold text-[#0F172A]">{task.title}</h1>
          <div className="flex gap-2 shrink-0">
            <Link href={`/tasks/${id}/edit`}>
              <Button variant="outline" size="sm">Edit</Button>
            </Link>
            <Button
              variant="outline" size="sm"
              className="text-red-500 border-red-200 hover:border-red-300"
              onClick={handleDelete} disabled={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <div className="grid grid-cols-2 gap-5 text-sm">

          {/* Client */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Client</p>
            <p className="font-semibold text-[#0F172A]">{task.client?.name}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Status</p>
            <select
              value={task.status}
              onChange={e => handleStatusChange(e.target.value as TaskStatus)}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 bg-white"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Pending On */}
          <div className="relative">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Pending On</p>
            <Input
              value={task.owner || ''}
              onChange={e => {
                handleOwnerChange(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Ahmed, Client, Dev team"
              className="h-8 text-sm"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
                {filteredSuggestions.map(s => (
                  <button
                    key={s}
                    onMouseDown={() => {
                      handleOwnerChange(s)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Due Date</p>
            {dueDateEditing ? (
              <Input
                ref={dueDateRef}
                type="date"
                defaultValue={task.due_date || ''}
                onBlur={e => handleDueDateChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDueDateChange((e.target as HTMLInputElement).value)}
                autoFocus
                className="h-8 text-sm"
              />
            ) : (
              <button
                onClick={() => setDueDateEditing(true)}
                className={`text-sm font-medium hover:text-[#2563EB] transition-colors ${
                  task.due_date
                    ? new Date(task.due_date) < new Date()
                      ? 'text-red-500'
                      : 'text-[#0F172A]'
                    : 'text-slate-400'
                }`}
              >
                {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'Set due date'}
              </button>
            )}
          </div>
        </div>

        {task.description && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-600">{task.description}</p>
          </div>
        )}
      </div>

      {/* Activity */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Activity</h2>

        {updates.length === 0 && (
          <p className="text-sm text-slate-400">No updates yet.</p>
        )}

        <div className="space-y-4">
          {[...updates].reverse().map((update: any) => (
            <div key={update.id} className="group flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-2 shrink-0" />
              <div className="flex-1">
                {editingUpdateId === update.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#2563EB] text-white hover:bg-blue-700 h-7 text-xs"
                        onClick={() => handleEditUpdate(update.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm" variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setEditingUpdateId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#0F172A]">{update.content}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                      </p>
                      <div className="hidden group-hover:flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUpdateId(update.id)
                            setEditingContent(update.content)
                          }}
                          className="text-xs text-slate-400 hover:text-[#2563EB] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUpdate(update.id)}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update composer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Add Update</h2>
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
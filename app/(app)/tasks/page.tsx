'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Task, Client, TaskStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge'
import { formatDistanceToNow, format, isAfter } from 'date-fns'

const STATUS_OPTIONS: TaskStatus[] = [
  'Not Started', 'In Progress', 'Waiting for Client', 'Done'
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(({ data }) => setClients(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (clientFilter) params.set('client_id', clientFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    if (showArchived) params.set('archived', 'true')

    fetch(`/api/tasks?${params}`)
      .then(r => r.json())
      .then(({ data }) => {
        setTasks(data || [])
        setLoading(false)
      })
  }, [clientFilter, statusFilter, search, showArchived])

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tasks.length} tasks</p>
        </div>
        <Link href="/tasks/new">
          <Button className="bg-[#2563EB] hover:bg-blue-700 text-white">+ New Task</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={clientFilter}
          onChange={e => setClientFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white"
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setShowArchived(prev => !prev)}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            showArchived
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
          }`}
        >
          {showArchived ? '✓ Archived' : 'Show Archived'}
        </button>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading...</p>}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">{showArchived ? 'No archived tasks' : 'No tasks found'}</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map(task => {
          const updates = (task as any).updates || []
          const lastUpdate = updates.length > 0
            ? [...updates].sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0]
            : null
          const isOverdue = task.due_date && isAfter(new Date(), new Date(task.due_date)) && task.status !== 'Done'

          return (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0F172A] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-medium text-slate-500">{task.client?.name}</span>
                      {task.owner && (
                        <>
                          <span className="text-slate-200">·</span>
                          <span className="text-xs text-slate-400">
                            Pending: <span className="text-slate-600 font-medium">{task.owner}</span>
                          </span>
                        </>
                      )}
                      {task.due_date && (
                        <>
                          <span className="text-slate-200">·</span>
                          <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                            {isOverdue ? '⚠ ' : ''}Due {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        </>
                      )}
                    </div>
                    {lastUpdate && (
                      <p className="text-xs text-slate-400 mt-1.5 truncate">
                        <span className="text-slate-300">↳ </span>{lastUpdate.content}
                      </p>
                    )}
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
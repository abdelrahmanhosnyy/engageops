'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Task, Meeting, Achievement, TaskStatus } from '@/types'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge'
import { formatDistanceToNow, format, isAfter, differenceInDays } from 'date-fns'

type DashboardData = {
  myTasks: Task[]
  waitingTasks: Task[]
  recentMeetings: Meeting[]
  recentAchievements: Achievement[]
}

function DueDateBadge({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null
  const date = new Date(dueDate)
  const overdue = isAfter(new Date(), date)
  const daysLeft = differenceInDays(date, new Date())

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      overdue
        ? 'bg-red-50 text-red-500'
        : daysLeft <= 2
        ? 'bg-amber-50 text-amber-600'
        : 'bg-slate-100 text-slate-500'
    }`}>
      {overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
    </span>
  )
}

function InlineDueDateEditor({ task, onUpdate }: { task: Task; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false)

  async function handleChange(val: string) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_date: val || null }),
    })
    setEditing(false)
    onUpdate()
  }

  if (editing) {
    return (
      <input
        type="date"
        defaultValue={task.due_date || ''}
        autoFocus
        onBlur={e => handleChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleChange((e.target as HTMLInputElement).value)}
        className="text-xs border border-slate-200 rounded px-1.5 py-0.5 w-32"
        onClick={e => e.preventDefault()}
      />
    )
  }

  return (
    <button
      onClick={e => { e.preventDefault(); setEditing(true) }}
      className="text-xs text-slate-400 hover:text-[#2563EB] transition-colors underline-offset-2 hover:underline"
    >
      {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'Set due date'}
    </button>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  function loadData() {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(({ data }) => {
        setData(data)
        setLoading(false)
      })
  }

  useEffect(() => { loadData() }, [])

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>
  if (!data) return null

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* My Tasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            My Tasks
            <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
              {data.myTasks.length} pending
            </span>
          </h2>
          <Link href="/tasks" className="text-xs text-[#2563EB] hover:underline">View all →</Link>
        </div>

        {data.myTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-8 text-center text-slate-400 text-sm">
            No pending tasks — you're clear.
          </div>
        ) : (
          <div className="space-y-2">
            {data.myTasks.map(task => {
              const updates = (task as any).updates || []
              const lastUpdate = updates.length > 0
                ? [...updates].sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )[0]
                : null

              return (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#0F172A] text-sm truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-medium text-slate-500">{task.client?.name}</span>
                          {task.owner && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-xs text-slate-400">
                                Pending: <span className="font-medium text-slate-600">{task.owner}</span>
                              </span>
                            </>
                          )}
                          <span className="text-slate-200">·</span>
                          <InlineDueDateEditor task={task} onUpdate={loadData} />
                          <DueDateBadge dueDate={task.due_date} />
                        </div>
                        {lastUpdate && (
                          <p className="text-xs text-slate-400 mt-1 truncate">
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
        )}
      </section>

      {/* Waiting for Client */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Waiting for Client
            <span className="ml-2 font-normal normal-case tracking-normal">
              {data.waitingTasks.length} open
            </span>
          </h2>
          <Link href="/tasks?status=Waiting+for+Client" className="text-xs text-[#2563EB] hover:underline">
            View all →
          </Link>
        </div>

        {data.waitingTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-8 text-center text-slate-400 text-sm">
            Nothing waiting on clients right now.
          </div>
        ) : (
          <div className="space-y-2">
            {data.waitingTasks.map(task => {
              const updates = (task as any).updates || []
              const lastUpdate = updates.length > 0
                ? [...updates].sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )[0]
                : null

              return (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#0F172A] text-sm truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-medium text-slate-500">{task.client?.name}</span>
                          <span className="text-slate-200">·</span>
                          <InlineDueDateEditor task={task} onUpdate={loadData} />
                          <DueDateBadge dueDate={task.due_date} />
                        </div>
                        {lastUpdate && (
                          <p className="text-xs text-slate-400 mt-1 truncate">
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
        )}
      </section>

      {/* Recent Meetings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Meetings</h2>
          <Link href="/meetings" className="text-xs text-[#2563EB] hover:underline">View all →</Link>
        </div>
        {data.recentMeetings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-8 text-center text-slate-400 text-sm">
            No meetings logged yet.
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentMeetings.map(meeting => (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] text-sm truncate">{meeting.title}</p>
                      <span className="text-xs font-medium text-slate-500">{meeting.client?.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {format(new Date(meeting.meeting_date), 'MMM d')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Achievements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Achievements</h2>
          <Link href="/achievements" className="text-xs text-[#2563EB] hover:underline">View all →</Link>
        </div>
        {data.recentAchievements.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-8 text-center text-slate-400 text-sm">
            No achievements yet.
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentAchievements.map(a => (
              <Link key={a.id} href={`/achievements/${a.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] text-sm truncate">{a.title}</p>
                      <span className="text-xs font-medium text-slate-500">{a.client?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-400">★</span>
                      <span className="text-xs text-slate-400">
                        {format(new Date(a.achievement_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
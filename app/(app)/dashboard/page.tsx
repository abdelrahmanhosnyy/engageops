'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Task, Meeting, Achievement } from '@/types'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge'
import { formatDistanceToNow, format } from 'date-fns'

type DashboardData = {
  myTasks: Task[]
  waitingTasks: Task[]
  recentMeetings: Meeting[]
  recentAchievements: Achievement[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(({ data }) => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>
  if (!data) return null

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* My Tasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
            My Tasks
            <span className="ml-2 text-xs font-normal text-slate-400 normal-case tracking-normal">
              {data.myTasks.length} pending
            </span>
          </h2>
          <Link href="/tasks?owner=Me" className="text-xs text-[#2563EB] hover:underline">
            View all →
          </Link>
        </div>

        {data.myTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-8 text-center text-slate-400 text-sm">
            No pending tasks — you're clear.
          </div>
        ) : (
          <div className="space-y-2">
            {data.myTasks.map(task => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-[#0F172A] text-sm truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{task.client?.name}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <TaskStatusBadge status={task.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Waiting for Client */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
            Waiting for Client
            <span className="ml-2 text-xs font-normal text-slate-400 normal-case tracking-normal">
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
            {data.waitingTasks.map(task => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-[#0F172A] text-sm truncate">{task.title}</p>
                      <span className="text-xs text-slate-400">{task.client?.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Meetings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
            Recent Meetings
          </h2>
          <Link href="/meetings" className="text-xs text-[#2563EB] hover:underline">
            View all →
          </Link>
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
                      <p className="font-medium text-[#0F172A] text-sm truncate">{meeting.title}</p>
                      <span className="text-xs text-slate-400">{meeting.client?.name}</span>
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
          <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
            Recent Achievements
          </h2>
          <Link href="/achievements" className="text-xs text-[#2563EB] hover:underline">
            View all →
          </Link>
        </div>

        {data.recentAchievements.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-8 text-center text-slate-400 text-sm">
            No achievements logged yet. Add your first win.
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentAchievements.map(achievement => (
              <Link key={achievement.id} href={`/achievements/${achievement.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-[#0F172A] text-sm truncate">{achievement.title}</p>
                      <span className="text-xs text-slate-400">{achievement.client?.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {format(new Date(achievement.achievement_date), 'MMM d')}
                    </span>
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
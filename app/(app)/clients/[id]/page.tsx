'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

type TimelineEntry = {
  id: string
  type: 'task' | 'meeting' | 'achievement'
  title: string
  subtitle: string
  date: string
  href: string
}

const typeConfig = {
  task:        { icon: '✓', color: 'text-blue-600',  bg: 'bg-blue-50',   label: 'Task' },
  meeting:     { icon: '◷', color: 'text-slate-600', bg: 'bg-slate-100', label: 'Meeting' },
  achievement: { icon: '★', color: 'text-amber-500', bg: 'bg-amber-50',  label: 'Achievement' },
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/clients/${id}/timeline`).then(r => r.json()),
    ]).then(([clientRes, timelineRes]) => {
      setClient(clientRes.data)
      setTimeline(timelineRes.data || [])
      setLoading(false)
    })
  }, [id])

  async function handleDelete() {
    if (!confirm(`Delete ${client?.name}? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/clients')
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>
  if (!client) return <div className="p-8 text-slate-400">Client not found.</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/clients" className="text-sm text-slate-400 hover:text-slate-600">
          ← Clients
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">{client.name}</h1>
            {client.notes && (
              <p className="text-sm text-slate-500 mt-1">{client.notes}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/clients/${id}/edit`}>
              <Button variant="outline" size="sm">Edit</Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:border-red-300"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        <Link href="/tasks/new">
          <Button variant="outline" size="sm">+ Task</Button>
        </Link>
        <Link href="/meetings/new">
          <Button variant="outline" size="sm">+ Meeting</Button>
        </Link>
        <Link href="/achievements/new">
          <Button variant="outline" size="sm">+ Achievement</Button>
        </Link>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-medium text-[#0F172A] mb-4">
          Timeline
          <span className="ml-2 text-xs font-normal text-slate-400">
            {timeline.length} entries
          </span>
        </h2>

        {timeline.length === 0 && (
          <p className="text-sm text-slate-400">
            No activity yet. Create a task, meeting, or achievement for this client.
          </p>
        )}

        <div className="relative">
          {timeline.length > 0 && (
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-100" />
          )}

          <div className="space-y-4">
            {timeline.map(entry => {
              const config = typeConfig[entry.type]
              return (
                <Link key={`${entry.type}-${entry.id}`} href={entry.href}>
                  <div className="flex gap-4 items-start group">
                    <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10`}>
                      <span className={`text-xs ${config.color}`}>{config.icon}</span>
                    </div>
                    <div className="flex-1 pb-1 group-hover:opacity-80 transition-opacity">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {entry.title}
                        </p>
                        <span className="text-xs text-slate-400 shrink-0">
                          {format(new Date(entry.date), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{entry.subtitle}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Meeting } from '@/types'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/meetings')
      .then(r => r.json())
      .then(({ data }) => {
        setMeetings(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Meetings</h1>
          <p className="text-sm text-slate-500 mt-0.5">{meetings.length} meetings</p>
        </div>
        <Link href="/meetings/new">
          <Button className="bg-[#2563EB] hover:bg-blue-700 text-white">
            + New Meeting
          </Button>
        </Link>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading...</p>}

      {!loading && meetings.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No meetings yet</p>
          <p className="text-sm mt-1">Log your first meeting to get started</p>
        </div>
      )}

      <div className="space-y-2">
        {meetings.map(meeting => (
          <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#0F172A]">{meeting.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{meeting.client?.name}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">
                      {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <span className="text-slate-300 text-lg">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
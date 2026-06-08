'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Meeting } from '@/types'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function MeetingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/meetings/${id}`)
      .then(r => r.json())
      .then(({ data }) => {
        setMeeting(data)
        setLoading(false)
      })
  }, [id])

  function handleCopyPrompt() {
    if (!meeting) return

    const actionItemsList = meeting.action_items
      ?.map(i => `- ${i.title} (${i.owner})`)
      .join('\n') || 'None'

    const prompt = `Act as a professional CRM consultant.

Using the following meeting notes and action items, create a professional client follow-up email.

Client:
${meeting.client?.name}

Meeting Notes:
${meeting.notes || 'No notes recorded'}

Action Items:
${actionItemsList}

Requirements:
- Clear ownership
- Bullet points
- Professional tone
- Concise summary
- Clear next steps`

    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('Delete this meeting?')) return
    setDeleting(true)
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    router.push('/meetings')
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>
  if (!meeting) return <div className="p-8 text-slate-400">Meeting not found.</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/meetings" className="text-sm text-slate-400 hover:text-slate-600">
          ← Meetings
        </Link>
        <div className="flex items-start justify-between mt-2 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">{meeting.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-400">{meeting.client?.name}</span>
              <span className="text-slate-200">·</span>
              <span className="text-sm text-slate-400">
                {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPrompt}
              className="text-[#2563EB] border-blue-200 hover:border-blue-300"
            >
              {copied ? '✓ Copied' : 'Copy Follow-Up Prompt'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:border-red-300"
              onClick={handleDelete}
              disabled={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Notes */}
      {meeting.notes && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <h2 className="text-sm font-medium text-[#0F172A] mb-2">Notes</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{meeting.notes}</p>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-[#0F172A] mb-3">Action Items</h2>

        {!meeting.action_items?.length && (
          <p className="text-sm text-slate-400">No action items recorded.</p>
        )}

        <div className="space-y-2">
          {meeting.action_items?.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <p className="text-sm text-[#0F172A]">{item.title}</p>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {item.owner}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks created notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          Tasks were automatically created for each action item. View them in the{' '}
          <Link href="/tasks" className="underline font-medium">Tasks</Link> section.
        </p>
      </div>
    </div>
  )
}
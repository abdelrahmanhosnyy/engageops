'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Achievement } from '@/types'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function AchievementDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/achievements/${id}`)
      .then(r => r.json())
      .then(({ data }) => {
        setAchievement(data)
        setLoading(false)
      })
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this achievement?')) return
    setDeleting(true)
    await fetch(`/api/achievements/${id}`, { method: 'DELETE' })
    router.push('/achievements')
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>
  if (!achievement) return <div className="p-8 text-slate-400">Achievement not found.</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/achievements" className="text-sm text-slate-400 hover:text-slate-600">
          ← Achievements
        </Link>
        <div className="flex items-start justify-between mt-2 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">{achievement.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-400">{achievement.client?.name}</span>
              <span className="text-slate-200">·</span>
              <span className="text-sm text-slate-400">
                {format(new Date(achievement.achievement_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/achievements/${id}/edit`}>
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

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        {achievement.description && (
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{achievement.description}</p>
          </div>
        )}
        {achievement.comments && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Comments</p>
            <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{achievement.comments}</p>
          </div>
        )}
        {!achievement.description && !achievement.comments && (
          <p className="text-sm text-slate-400">No details recorded.</p>
        )}
      </div>
    </div>
  )
}
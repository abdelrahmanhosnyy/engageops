'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Achievement } from '@/types'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achievements')
      .then(r => r.json())
      .then(({ data }) => {
        setAchievements(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Achievements</h1>
          <p className="text-sm text-slate-500 mt-0.5">{achievements.length} logged</p>
        </div>
        <Link href="/achievements/new">
          <Button className="bg-[#2563EB] hover:bg-blue-700 text-white">
            + New Achievement
          </Button>
        </Link>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading...</p>}

      {!loading && achievements.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No achievements yet</p>
          <p className="text-sm mt-1">Start logging wins to build your record</p>
        </div>
      )}

      <div className="space-y-2">
        {achievements.map(achievement => (
          <Link key={achievement.id} href={`/achievements/${achievement.id}`}>
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F172A] truncate">{achievement.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{achievement.client?.name}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">
                      {format(new Date(achievement.achievement_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <span className="text-amber-400 text-lg">★</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
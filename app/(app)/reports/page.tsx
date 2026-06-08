'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

type ReportClient = {
  client: { id: string; name: string }
  tasks: { id: string; title: string; updated_at: string }[]
  achievements: { id: string; title: string; achievement_date: string }[]
}

export default function ReportsPage() {
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly')
  const [refDate, setRefDate] = useState(new Date())
  const [data, setData] = useState<ReportClient[]>([])
  const [range, setRange] = useState<{ start: string; end: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function navigate(direction: 'prev' | 'next') {
    setRefDate(prev => {
      if (type === 'weekly') {
        return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
      } else {
        return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
      }
    })
  }

  function getPeriodLabel() {
    if (type === 'weekly') {
      const start = startOfWeek(refDate, { weekStartsOn: 0 })
      const end = endOfWeek(refDate, { weekStartsOn: 0 })
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
    }
    return format(refDate, 'MMMM yyyy')
  }

  async function generateReport() {
    setLoading(true)
    const res = await fetch(`/api/reports?type=${type}&date=${refDate.toISOString()}`)
    const { data, start, end } = await res.json()
    setData(data || [])
    setRange({ start, end })
    setLoading(false)
  }

  function copyAsText() {
    if (!data.length) return

    const lines: string[] = []
    lines.push(`${type === 'weekly' ? 'Weekly' : 'Monthly'} Report — ${getPeriodLabel()}`)
    lines.push('')

    data.forEach(({ client, tasks, achievements }) => {
      lines.push(`── ${client.name} ──`)
      if (tasks.length > 0) {
        lines.push('Completed Tasks:')
        tasks.forEach(t => lines.push(`  ✓ ${t.title}`))
      }
      if (achievements.length > 0) {
        lines.push('Achievements:')
        achievements.forEach(a => lines.push(`  ★ ${a.title}`))
      }
      lines.push('')
    })

    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0F172A]">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Completed tasks and achievements by client</p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setType('weekly')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'weekly'
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setType('monthly')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'monthly'
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Period navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('prev')}
            className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
          >
            ◀
          </button>
          <span className="text-sm font-medium text-[#0F172A] min-w-48 text-center">
            {getPeriodLabel()}
          </span>
          <button
            onClick={() => navigate('next')}
            className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
          >
            ▶
          </button>
        </div>

        <Button
          className="bg-[#2563EB] hover:bg-blue-700 text-white"
          onClick={generateReport}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {/* Results */}
      {data.length === 0 && range && (
        <div className="text-center py-12 text-slate-400">
          <p>No completed tasks or achievements for this period.</p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={copyAsText}>
              {copied ? '✓ Copied' : 'Copy as Text'}
            </Button>
          </div>

          <div className="space-y-4">
            {data.map(({ client, tasks, achievements }) => (
              <div key={client.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="font-semibold text-[#0F172A] mb-3">{client.name}</h2>

                {tasks.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                      Completed Tasks ({tasks.length})
                    </p>
                    <div className="space-y-1">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2">
                          <span className="text-[#16A34A] text-sm">✓</span>
                          <span className="text-sm text-[#0F172A]">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {achievements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                      Achievements ({achievements.length})
                    </p>
                    <div className="space-y-1">
                      {achievements.map(a => (
                        <div key={a.id} className="flex items-center gap-2">
                          <span className="text-amber-400 text-sm">★</span>
                          <span className="text-sm text-[#0F172A]">{a.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type SearchResult = {
  id: string
  type: 'client' | 'task' | 'meeting' | 'achievement'
  title: string
  subtitle: string
  href: string
}

const typeIcon = {
  client:      '◎',
  task:        '✓',
  meeting:     '◷',
  achievement: '★',
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timeout = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const { data } = await res.json()
      setResults(data || [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  function handleSelect(href: string) {
    setOpen(false)
    setQuery('')
    setResults([])
    router.push(href)
  }

  return (
    <>
      {/* Trigger button in sidebar */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <span>🔍</span>
        <span>Search</span>
        <kbd className="ml-auto text-xs bg-slate-100 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-lg">
          <div className="p-3 border-b border-slate-100">
            <Input
              autoFocus
              placeholder="Search tasks, meetings, clients..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 text-base"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="text-sm text-slate-400 p-4">Searching...</p>
            )}

            {!loading && query && results.length === 0 && (
              <p className="text-sm text-slate-400 p-4">No results for "{query}"</p>
            )}

            {!loading && !query && (
              <p className="text-sm text-slate-400 p-4">Start typing to search...</p>
            )}

            {results.map(result => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result.href)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-slate-400 text-sm w-4">{typeIcon[result.type]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{result.title}</p>
                  <p className="text-xs text-slate-400">{result.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
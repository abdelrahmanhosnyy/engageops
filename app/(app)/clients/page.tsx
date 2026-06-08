'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(({ data }) => {
        setClients(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} active clients</p>
        </div>
        <Link href="/clients/new">
          <Button className="bg-[#2563EB] hover:bg-blue-700 text-white">
            + New Client
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Search clients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />

      {loading && (
        <p className="text-slate-400 text-sm">Loading...</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No clients yet</p>
          <p className="text-sm mt-1">Create your first client to get started</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(client => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#0F172A]">{client.name}</p>
                  {client.notes && (
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{client.notes}</p>
                  )}
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
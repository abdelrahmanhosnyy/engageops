'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client } from '@/types'
import { Button } from '@/components/ui/button'

export default function ClientDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(({ data }) => {
        setClient(data)
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
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-sm text-slate-400">
          Timeline coming in Phase 5 — tasks, meetings, and achievements will appear here.
        </p>
      </div>
    </div>
  )
}
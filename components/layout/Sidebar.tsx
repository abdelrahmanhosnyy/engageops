'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
  { label: 'Clients', href: '/clients', icon: '◎' },
  { label: 'Tasks', href: '/tasks', icon: '✓' },
  { label: 'Meetings', href: '/meetings', icon: '◷' },
  { label: 'Achievements', href: '/achievements', icon: '★' },
  { label: 'Reports', href: '/reports', icon: '▤' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
      <div className="px-4 py-5 border-b border-slate-200">
        <span className="font-semibold text-[#0F172A] text-sm">EngageOps</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-4 border-t border-slate-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors w-full"
        >
          <span>→</span> Sign out
        </button>
      </div>
    </aside>
  )
}
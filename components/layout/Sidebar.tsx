'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import SearchDialog from '@/components/shared/SearchDialog'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',    emoji: '🏠' },
  { label: 'Clients',      href: '/clients',      emoji: '🏢' },
  { label: 'Tasks',        href: '/tasks',        emoji: '✅' },
  { label: 'Meetings',     href: '/meetings',     emoji: '🗓️' },
  { label: 'Achievements', href: '/achievements', emoji: '🏆' },
  { label: 'Reports',      href: '/reports',      emoji: '📊' },
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
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100">
        <span className="font-extrabold text-[#0F172A] text-base tracking-tight">
          Engage<span className="text-[#2563EB]">Ops</span>
        </span>
      </div>

      {/* Search */}
      <div className="px-2 pt-3 pb-1">
        <SearchDialog />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-slate-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors w-full"
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  )
}
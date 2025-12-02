'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-lg font-semibold">Welcome back, {session?.user?.name || 'Researcher'}</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-x-2 text-sm">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{session?.user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

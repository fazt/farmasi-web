'use client'

import { Moon, Sun, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const router = useRouter()

  const handleNewLoan = () => {
    router.push('/dashboard/loans/new')
  }

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewLoan}
          className="bg-[#FF5B67] hover:bg-[#FF4755] text-white border-[#FF5B67] hover:border-[#FF4755]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Préstamo
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        {session && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{session.user.name}</span>
          </div>
        )}
      </div>
    </header>
  )
}
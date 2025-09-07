'use client'

import Link from 'next/link'
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Shield, 
  FileText, 
  Settings,
  Home,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Clientes',
    url: '/dashboard/clients',
    icon: Users,
  },
  {
    title: 'Préstamos',
    url: '/dashboard/loans',
    icon: CreditCard,
  },
  {
    title: 'Pagos',
    url: '/dashboard/payments',
    icon: DollarSign,
  },
  {
    title: 'Tasas de Interés',
    url: '/dashboard/interest-rates',
    icon: Settings,
  },
  {
    title: 'Garantías',
    url: '/dashboard/guarantees',
    icon: Shield,
  },
  {
    title: 'Contratos',
    url: '/dashboard/contracts',
    icon: FileText,
  },
]

export function AppSidebar() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-lg">Farmasi</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
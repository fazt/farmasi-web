'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Shield, 
  FileText, 
  Settings,
  Home,
  LogOut,
  Percent,
  User,
  MessageSquare,
  Briefcase,
  FolderOpen
} from 'lucide-react'
import { useState } from 'react'
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const mainItems = [
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
]

const prestamosItems = [
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
    title: 'Garantías',
    url: '/dashboard/guarantees',
    icon: Shield,
  },
]

const contratosItems = [
  {
    title: 'Lista de Contratos',
    url: '/dashboard/contracts',
    icon: FileText,
  },
  {
    title: 'Plantillas de Contratos',
    url: '/dashboard/templates?tab=contract',
    icon: FileText,
  },
]

const configurationItems = [
  {
    title: 'Tasa de Interés',
    url: '/dashboard/interest-rates',
    icon: Percent,
  },
  {
    title: 'Usuarios',
    url: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Mi Perfil',
    url: '/dashboard/profile',
    icon: User,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-lg">Grupo Ascona</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg" isActive={isActive(item.url)}>
                    <Link href={item.url} className="py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PRESTAMOS Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Préstamos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {prestamosItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg" isActive={isActive(item.url)}>
                    <Link href={item.url} className="py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CONTRATOS Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Contratos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {contratosItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg" isActive={isActive(item.url)}>
                    <Link href={item.url} className="py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* CONFIGURACION Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {configurationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg" isActive={isActive(item.url)}>
                    <Link href={item.url} className="py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Card className="bg-black/10 dark:bg-white/10">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-full bg-black/20 dark:bg-white/20 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-black dark:text-white">Admin</span>
                  <span className="text-[10px] text-black/70 dark:text-white/80">admin@grupoascona.com</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-black/70 hover:text-black hover:bg-black/20 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/20"
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </SidebarFooter>
    </Sidebar>
  )
}
'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clientes',
  loans: 'Préstamos',
  payments: 'Pagos',
  'interest-rates': 'Tasas de Interés',
  guarantees: 'Garantías',
  contracts: 'Contratos',
  settings: 'Configuración',
  profile: 'Perfil',
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        
        {segments.slice(1).map((segment, index) => {
          const href = `/${segments.slice(0, index + 2).join('/')}`
          const label = pathLabels[segment] || segment
          const isLast = index === segments.length - 2

          return (
            <div key={segment} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
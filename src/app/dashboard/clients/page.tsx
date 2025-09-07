import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ClientsPageClient } from '@/components/clients/clients-page-client'
import { getClients } from '@/lib/actions/clients'

export default async function ClientsPage() {
  const { clients, pagination } = await getClients()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Administra la información de todos los clientes
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>
                  Busca y administra los clientes registrados en el sistema
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{pagination.total}</div>
                <div className="text-sm text-muted-foreground">Total de clientes</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClientsPageClient 
              initialClients={clients}
              initialPagination={pagination}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
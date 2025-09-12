import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, CreditCard, DollarSign, FileText, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

async function getClientDetails(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/clients/${id}/details`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await getClientDetails(params.id)

  if (!client) {
    notFound()
  }

  const totalPendingPayments = client.loans?.reduce((acc: number, loan: any) => {
    return acc + loan.payments.filter((p: any) => p.status === 'PENDING').length
  }, 0) || 0

  const totalDebt = client.loans?.reduce((acc: number, loan: any) => {
    if (loan.status === 'ACTIVE') {
      const pendingPayments = loan.payments.filter((p: any) => p.status === 'PENDING')
      return acc + pendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
    }
    return acc
  }, 0) || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/clients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {client.firstName} {client.lastName}
              </h1>
              <p className="text-muted-foreground">
                Información detallada del cliente
              </p>
            </div>
          </div>
          <Link href={`/dashboard/clients/${params.id}/edit`}>
            <Button>Editar Cliente</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {client.loans?.filter((l: any) => l.status === 'ACTIVE').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                de {client.loans?.length || 0} totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                en todos los préstamos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ {totalDebt.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                suma de pagos pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Garantías</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.guarantees?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                garantías registradas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documento</p>
                <p className="text-base">
                  {client.documentType || 'DNI'}: {client.documentNumber || 'No registrado'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-base">{client.phone || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{client.email || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                <p className="text-base">{client.address || 'No registrada'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente desde</p>
                <p className="text-base">
                  {format(new Date(client.createdAt), 'dd MMMM yyyy', { locale: es })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Préstamos
              </CardTitle>
              <CardDescription>
                Historial de préstamos del cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {client.loans && client.loans.length > 0 ? (
                <div className="space-y-4">
                  {client.loans.map((loan: any) => (
                    <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">S/ {loan.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(loan.startDate), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          loan.status === 'ACTIVE' ? 'default' :
                          loan.status === 'COMPLETED' ? 'secondary' : 'destructive'
                        }>
                          {loan.status === 'ACTIVE' ? 'Activo' :
                           loan.status === 'COMPLETED' ? 'Completado' : 'Vencido'}
                        </Badge>
                        <Link href={`/dashboard/loans/${loan.id}`}>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay préstamos registrados</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Garantías
            </CardTitle>
            <CardDescription>
              Garantías dejadas por el cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.guarantees && client.guarantees.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {client.guarantees.map((guarantee: any) => (
                  <div key={guarantee.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>{guarantee.type}</Badge>
                      <Badge variant="outline">
                        S/ {guarantee.estimatedValue?.toFixed(2) || '0.00'}
                      </Badge>
                    </div>
                    <p className="font-medium">{guarantee.description}</p>
                    {guarantee.brand && (
                      <p className="text-sm text-muted-foreground">Marca: {guarantee.brand}</p>
                    )}
                    {guarantee.model && (
                      <p className="text-sm text-muted-foreground">Modelo: {guarantee.model}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Registrado: {format(new Date(guarantee.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay garantías registradas</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pagos Pendientes
            </CardTitle>
            <CardDescription>
              Próximos pagos a realizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.loans && client.loans.some((l: any) => l.payments.some((p: any) => p.status === 'PENDING')) ? (
              <div className="space-y-4">
                {client.loans.map((loan: any) => 
                  loan.payments
                    .filter((payment: any) => payment.status === 'PENDING')
                    .map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">S/ {payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            Préstamo de S/ {loan.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(payment.dueDate), 'dd MMM yyyy', { locale: es })}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            Semana {payment.weekNumber}
                          </Badge>
                        </div>
                      </div>
                    ))
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay pagos pendientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
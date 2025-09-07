import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Users, CreditCard, DollarSign, AlertCircle, Clock, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DashboardPage() {
  // Fetch real data from the database
  const [
    totalClients,
    activeLoans,
    totalPayments,
    overdueLoans,
    upcomingDueLoans,
    totalGuarantees,
    totalContracts,
    recentPayments,
  ] = await Promise.all([
    // Total clients
    prisma.client.count(),
    
    // Active loans
    prisma.loan.count({
      where: { status: 'ACTIVE' }
    }),
    
    // Total revenue from payments
    prisma.payment.aggregate({
      _sum: { amount: true }
    }),
    
    // Overdue loans
    prisma.loan.count({
      where: {
        OR: [
          { status: 'OVERDUE' },
          {
            status: 'ACTIVE',
            dueDate: { lt: new Date() }
          }
        ]
      }
    }),
    
    // Loans due in next 7 days
    prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        client: true
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    }),
    
    // Total guarantees
    prisma.guarantee.count(),
    
    // Total contracts
    prisma.contract.count(),
    
    // Recent payments (last 5)
    prisma.payment.findMany({
      include: {
        loan: {
          include: {
            client: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  const stats = {
    totalClients,
    activeLoans,
    totalRevenue: totalPayments._sum.amount || 0,
    overdueLoans,
    totalGuarantees,
    totalContracts,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de préstamos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/clients">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  Clientes registrados
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/loans">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Préstamos Activos
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.activeLoans}</div>
                <p className="text-xs text-muted-foreground">
                  Préstamos en curso
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/payments">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Total recaudado
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/loans">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Préstamos Vencidos
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueLoans}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/guarantees">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Garantías
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGuarantees}</div>
                <p className="text-xs text-muted-foreground">
                  Garantías registradas
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/contracts">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Contratos
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContracts}</div>
                <p className="text-xs text-muted-foreground">
                  Contratos generados
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/loans">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vencen Pronto
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{upcomingDueLoans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Próximos 7 días
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Pagos Recientes</CardTitle>
              <CardDescription>
                Últimos pagos registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {payment.loan.client.firstName} {payment.loan.client.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Pago #{payment.id.slice(-8)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No hay pagos registrados
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Próximos Vencimientos</CardTitle>
              <CardDescription>
                Préstamos que vencen en los próximos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDueLoans.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDueLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {loan.client.firstName} {loan.client.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vence: {format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">
                          {formatCurrency(Number(loan.balance))}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {Math.ceil((new Date(loan.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No hay préstamos próximos a vencer
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
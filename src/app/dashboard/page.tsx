import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Users, CreditCard, DollarSign, AlertCircle, Clock, FileText, TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DashboardPage() {
  // Get last 6 months for trend analysis
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Fetch real data from the database
  const [
    totalClients,
    activeLoans,
    totalPayments,
    overdueLoans,
    upcomingDueLoans,
    overdueLoansData,
    totalGuarantees,
    totalContracts,
    recentPayments,
    clientTrends,
    loanTrends,
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

    // Overdue loans with client details
    prisma.loan.findMany({
      where: {
        OR: [
          { status: 'OVERDUE' },
          {
            status: 'ACTIVE',
            dueDate: { lt: new Date() }
          }
        ]
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
    }),

    // Client creation trends (last 6 months) - using Prisma groupBy
    prisma.client.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }).then(results => {
      // Group by month
      const monthlyData: { [key: string]: number } = {}

      results.forEach(result => {
        const month = result.createdAt.toISOString().slice(0, 7) // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + result._count.id
      })

      return Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      })).sort((a, b) => a.month.localeCompare(b.month))
    }),

    // Loan creation trends (last 6 months) - using Prisma groupBy
    prisma.loan.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }).then(results => {
      // Group by month
      const monthlyData: { [key: string]: number } = {}

      results.forEach(result => {
        const month = result.createdAt.toISOString().slice(0, 7) // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + result._count.id
      })

      return Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      })).sort((a, b) => a.month.localeCompare(b.month))
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

        {/* Main Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/clients">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clientes
                </CardTitle>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalClients}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+12%</span>
                  <span className="ml-1">vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/loans">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Préstamos Activos
                </CardTitle>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.activeLoans}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Activity className="h-3 w-3 text-blue-500 mr-1" />
                  <span>En proceso</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/payments">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </CardTitle>
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+18%</span>
                  <span className="ml-1">este mes</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/loans?status=OVERDUE">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Préstamos Vencidos
                </CardTitle>
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.overdueLoans}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">-8%</span>
                  <span className="ml-1">mejorando</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/dashboard/guarantees">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Total Garantías
                </CardTitle>
                <div className="h-8 w-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800">{stats.totalGuarantees}</div>
                <p className="text-xs text-purple-600 mt-1">
                  Garantías registradas
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/contracts">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">
                  Total Contratos
                </CardTitle>
                <div className="h-8 w-8 bg-indigo-200 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-800">{stats.totalContracts}</div>
                <p className="text-xs text-indigo-600 mt-1">
                  Contratos generados
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/loans?due_soon=true">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">
                  Vencen Pronto
                </CardTitle>
                <div className="h-8 w-8 bg-amber-200 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">{upcomingDueLoans.length}</div>
                <p className="text-xs text-amber-600 mt-1">
                  Próximos 7 días
                </p>
                {upcomingDueLoans.length > 0 && (
                  <Progress value={(upcomingDueLoans.length / stats.activeLoans) * 100} className="mt-2" />
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <Link href="/dashboard/loans/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Nuevo Préstamo
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              <DollarSign className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          </Link>
          <Link href="/dashboard/clients/new">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Users className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
          <Link href="/dashboard/guarantees/new">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <Shield className="h-4 w-4 mr-2" />
              Nueva Garantía
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-3 shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-800">Pagos Recientes</CardTitle>
                  <CardDescription>
                    Últimos pagos registrados en el sistema
                  </CardDescription>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
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
          <Card className="col-span-4 shadow-lg border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-red-800">Pagos Vencidos</CardTitle>
                  <CardDescription>
                    Préstamos con pagos atrasados
                  </CardDescription>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {overdueLoansData.length > 0 ? (
                <div className="space-y-4">
                  {overdueLoansData.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {loan.client.firstName} {loan.client.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Venció: {format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">
                          {formatCurrency(Number(loan.balance))}
                        </p>
                        <Badge variant="destructive" className="text-xs">
                          {Math.ceil((new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24))} días atraso
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No hay préstamos vencidos
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PaymentsTable } from '@/components/payments/payments-table'

interface Payment {
  id: string
  amount: number
  paymentDate: Date
  createdAt: Date
  loan: {
    id: string
    amount: number
    weeklyPayment: number
    totalAmount: number
    paidAmount: number
    balance: number
    status: string
    client: {
      id: string
      firstName: string
      lastName: string
      email?: string | null
      phone?: string | null
    }
    interestRate: {
      loanAmount: number
      weeklyPayment: number
      weeksCount: number
    }
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const router = useRouter()

  const fetchPayments = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      })

      const response = await fetch(`/api/payments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching payments:', data.error)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleSearch = () => {
    fetchPayments(1, search)
  }


  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPayments(pagination.page, search)
      } else {
        const error = await response.json()
        console.error('Error deleting payment:', error)
        alert(error.error || 'Error al eliminar el pago')
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert('Error al eliminar el pago')
    }
  }

  const handleViewPayment = (payment: Payment) => {
    // TODO: Implement payment detail view
    console.log('View payment:', payment)
  }

  const handleNewPayment = () => {
    router.push('/dashboard/payments/new')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  // Calculate statistics
  const stats = payments.reduce(
    (acc, payment) => {
      acc.totalAmount += payment.amount
      acc.count++
      
      // Today's payments
      const today = new Date()
      const paymentDate = new Date(payment.paymentDate)
      if (
        paymentDate.getDate() === today.getDate() &&
        paymentDate.getMonth() === today.getMonth() &&
        paymentDate.getFullYear() === today.getFullYear()
      ) {
        acc.todayAmount += payment.amount
        acc.todayCount++
      }
      
      // This week's payments
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      weekStart.setHours(0, 0, 0, 0)
      
      if (paymentDate >= weekStart) {
        acc.weekAmount += payment.amount
      }
      
      return acc
    },
    { 
      totalAmount: 0, 
      count: 0,
      todayAmount: 0,
      todayCount: 0,
      weekAmount: 0,
    }
  )

  const averagePayment = stats.count > 0 ? stats.totalAmount / stats.count : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">
            Registra y administra todos los pagos de préstamos
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Recaudado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.count} pagos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pagos de Hoy
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.todayAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.todayCount} pago(s) hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Esta Semana
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.weekAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Recaudado esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pago Promedio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(averagePayment)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por transacción
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>
              Busca y administra todos los pagos registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar por cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleNewPayment}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </div>

            <PaymentsTable
              payments={payments}
              onDelete={handleDeletePayment}
              onView={handleViewPayment}
              isLoading={loading}
            />

            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchPayments(pagination.page - 1, search)}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchPayments(pagination.page + 1, search)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
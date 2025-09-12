'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, DollarSign, TrendingUp, Calendar, Download, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface PaymentStats {
  total: {
    amount: number
    count: number
    profit: number
  }
  today: {
    amount: number
    count: number
  }
  week: {
    amount: number
    count: number
  }
}

interface PaymentsClientProps {
  initialPayments: Payment[]
  initialPagination: PaginationData
  initialStats: PaymentStats
}

export function PaymentsClient({ 
  initialPayments, 
  initialPagination, 
  initialStats 
}: PaymentsClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [stats, setStats] = useState<PaymentStats>(initialStats)
  const [pagination, setPagination] = useState<PaginationData>(initialPagination)
  const router = useRouter()

  const fetchPayments = async (page = 1, searchTerm = '', groupFilter = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      })

      if (groupFilter) {
        params.append('group', groupFilter)
      }

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

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/payments/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      } else {
        console.error('Error fetching payment stats:', data.error)
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSearch = () => {
    const groupFilter = selectedGroup === 'all' ? '' : selectedGroup
    fetchPayments(1, search, groupFilter)
  }

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group)
    const groupFilter = group === 'all' ? '' : group
    fetchPayments(1, search, groupFilter)
  }

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const groupFilter = selectedGroup === 'all' ? '' : selectedGroup
        fetchPayments(pagination.page, search, groupFilter)
        fetchStats() // Refresh stats after deletion
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

  // Función para obtener el número de semana del año (empezando los domingos)
  const getWeekNumber = (date: Date): number => {
    const currentYear = date.getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const firstSunday = new Date(startOfYear)
    const dayOfWeek = startOfYear.getDay()
    
    if (dayOfWeek !== 0) {
      firstSunday.setDate(startOfYear.getDate() - dayOfWeek)
    }
    
    const diffTime = date.getTime() - firstSunday.getTime()
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks + 1
  }

  // Generar opciones de grupos (semanas del año)
  const generateGroupOptions = () => {
    const currentYear = new Date().getFullYear()
    const options = []
    for (let i = 1; i <= 53; i++) {
      options.push({
        value: i.toString(),
        label: `Grupo ${i} (Semana ${i})`
      })
    }
    return options
  }

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (payments.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    const data = payments.map(payment => {
      const loanAmount = Number(payment.loan.amount)
      const totalAmount = Number(payment.loan.totalAmount)
      const profit = totalAmount - loanAmount
      
      return {
        'Fecha': new Date(payment.paymentDate).toLocaleDateString('es-PE'),
        'Cliente': `${payment.loan.client.firstName} ${payment.loan.client.lastName}`,
        'Teléfono': payment.loan.client.phone || 'N/A',
        'Email': payment.loan.client.email || 'N/A',
        'Monto Pago': Number(payment.amount),
        'Monto Préstamo': loanAmount,
        'Total a Pagar': totalAmount,
        'Ganancia por Préstamo': profit,
        'Estado Préstamo': payment.loan.status,
        'Semana': getWeekNumber(new Date(payment.paymentDate))
      }
    })

    // Add summary row with total profit
    const totalProfit = data.reduce((sum, row) => sum + row['Ganancia por Préstamo'], 0)
    data.push({
      'Fecha': '',
      'Cliente': '',
      'Teléfono': '',
      'Email': '',
      'Monto Pago': '',
      'Monto Préstamo': '',
      'Total a Pagar': 'TOTAL GANANCIAS:',
      'Ganancia por Préstamo': totalProfit,
      'Estado Préstamo': '',
      'Semana': ''
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pagos')
    
    const filename = selectedGroup 
      ? `pagos_grupo_${selectedGroup}_${new Date().getFullYear()}.xlsx`
      : `pagos_${new Date().toISOString().split('T')[0]}.xlsx`
    
    XLSX.writeFile(wb, filename)
  }

  // Función para exportar a PDF
  const exportToPDF = () => {
    if (payments.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(20)
    doc.text('Reporte de Pagos', 14, 22)
    
    if (selectedGroup) {
      doc.setFontSize(12)
      doc.text(`Grupo ${selectedGroup} (Semana ${selectedGroup})`, 14, 32)
    }
    
    // Calculate total profit first
    const totalProfit = payments.reduce((sum, payment) => {
      const loanAmount = Number(payment.loan.amount)
      const totalAmount = Number(payment.loan.totalAmount)
      return sum + (totalAmount - loanAmount)
    }, 0)

    // Preparar datos para la tabla
    const tableData = payments.map(payment => {
      const loanAmount = Number(payment.loan.amount)
      const totalAmount = Number(payment.loan.totalAmount)
      const profit = totalAmount - loanAmount
      
      return [
        new Date(payment.paymentDate).toLocaleDateString('es-PE'),
        `${payment.loan.client.firstName} ${payment.loan.client.lastName}`,
        payment.loan.client.phone || 'N/A',
        formatCurrency(Number(payment.amount)),
        formatCurrency(profit),
        payment.loan.status
      ]
    })

    // Add total row - ensure tableData is an array
    if (Array.isArray(tableData)) {
      tableData.push([
        '', '', '', 'TOTAL GANANCIAS:', formatCurrency(totalProfit), ''
      ])
    } else {
      console.error('tableData is not an array:', tableData)
      return
    }
    
    // Agregar tabla
    (doc as any).autoTable({
      head: [['Fecha', 'Cliente', 'Teléfono', 'Monto Pago', 'Ganancia', 'Estado']],
      body: tableData,
      startY: selectedGroup ? 40 : 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 91, 103] }
    })
    
    const filename = selectedGroup 
      ? `pagos_grupo_${selectedGroup}_${new Date().getFullYear()}.pdf`
      : `pagos_${new Date().toISOString().split('T')[0]}.pdf`
    
    doc.save(filename)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards - New Design */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Recaudado
              </p>
              <div className="text-xl font-bold text-green-600">
                {statsLoading ? '...' : formatCurrency(stats.total.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '...' : `${stats.total.count} pagos totales`}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Pagos de Hoy
              </p>
              <div className="text-xl font-bold">
                {statsLoading ? '...' : formatCurrency(stats.today.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '...' : `${stats.today.count} transacciones`}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Esta Semana
              </p>
              <div className="text-xl font-bold">
                {statsLoading ? '...' : formatCurrency(stats.week.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '...' : `${stats.week.count} pagos`}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ganancias Totales
              </p>
              <div className="text-xl font-bold text-green-600">
                {statsLoading ? '...' : formatCurrency(stats.total.profit)}
              </div>
              <p className="text-xs text-muted-foreground">
                De préstamos pagados
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
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
              
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grupos</SelectItem>
                  {generateGroupOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={payments.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar a PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={handleNewPayment}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </div>
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
                onClick={() => {
                  const groupFilter = selectedGroup === 'all' ? '' : selectedGroup
                  fetchPayments(pagination.page - 1, search, groupFilter)
                }}
                disabled={pagination.page <= 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {pagination.page} de {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  const groupFilter = selectedGroup === 'all' ? '' : selectedGroup
                  fetchPayments(pagination.page + 1, search, groupFilter)
                }}
                disabled={pagination.page >= pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
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
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoansTable } from '@/components/loans/loans-table'

interface Loan {
  id: string
  amount: number
  weeklyPayment: number
  totalAmount: number
  paidAmount: number
  balance: number
  status: 'ACTIVE' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  loanDate: Date
  dueDate: Date
  completedAt?: Date | null
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
  guarantee: {
    id: string
    name: string
    value: number
  }
  payments: any[]
  _count: {
    payments: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const router = useRouter()

  const fetchLoans = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: status,
      })

      const response = await fetch(`/api/loans?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLoans(data.loans)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching loans:', data.error)
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const handleSearch = () => {
    fetchLoans(1, search, statusFilter === 'ALL' ? '' : statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    fetchLoans(1, search, status === 'ALL' ? '' : status)
  }


  const handleDeleteLoan = async (id: string) => {
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchLoans(pagination.page, search, statusFilter === 'ALL' ? '' : statusFilter)
      } else {
        const error = await response.json()
        console.error('Error deleting loan:', error)
        alert(error.error || 'Error al eliminar el préstamo')
      }
    } catch (error) {
      console.error('Error deleting loan:', error)
      alert('Error al eliminar el préstamo')
    }
  }

  const handleViewLoan = (loan: Loan) => {
    // TODO: Implement loan detail view
    console.log('View loan:', loan)
  }

  const handleEditLoan = (loan: Loan) => {
    // TODO: Implement payment registration
    console.log('Edit loan (register payment):', loan)
  }

  const handleNewLoan = () => {
    router.push('/dashboard/loans/new')
  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
          <p className="text-muted-foreground">
            Administra todos los préstamos del sistema
          </p>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Lista de Préstamos</CardTitle>
            <CardDescription>
              Busca y administra todos los préstamos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  placeholder="Buscar por cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="max-w-sm"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value="ACTIVE">Activos</SelectItem>
                    <SelectItem value="PAID">Pagados</SelectItem>
                    <SelectItem value="OVERDUE">Vencidos</SelectItem>
                    <SelectItem value="CANCELLED">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleNewLoan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Préstamo
                </Button>
              </div>
            </div>

            <LoansTable
              loans={loans}
              onEdit={handleEditLoan}
              onDelete={handleDeleteLoan}
              onView={handleViewLoan}
              isLoading={loading}
            />

            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchLoans(pagination.page - 1, search, statusFilter === 'ALL' ? '' : statusFilter)}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchLoans(pagination.page + 1, search, statusFilter === 'ALL' ? '' : statusFilter)}
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
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LoansTable } from '@/components/loans/loans-table'
import { LoanDetailsDrawer } from '@/components/loans/loan-details-drawer'

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

interface LoansClientProps {
  initialLoans: Loan[]
  initialPagination: PaginationData
}

export function LoansClient({ initialLoans, initialPagination }: LoansClientProps) {
  const [loans, setLoans] = useState<Loan[]>(initialLoans)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationData>(initialPagination)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')

  useEffect(() => {
    if (clientId) {
      fetchLoans(1, search, statusFilter === 'ALL' ? '' : statusFilter)
    }
  }, [clientId])

  const fetchLoans = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: status,
      })

      if (clientId) {
        params.append('clientId', clientId)
      }

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
    setSelectedLoan(loan)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedLoan(null)
  }

  const handleUpdateDueDate = async (loanId: string, newDueDate: Date) => {
    try {
      const response = await fetch(`/api/loans/${loanId}/due-date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: newDueDate.toISOString() }),
      })

      if (response.ok) {
        const updatedLoan = await response.json()
        
        // Update the loans list
        setLoans(prevLoans => 
          prevLoans.map(loan => 
            loan.id === loanId ? updatedLoan : loan
          )
        )
        
        // Update the selected loan if it's the same one
        if (selectedLoan?.id === loanId) {
          setSelectedLoan(updatedLoan)
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar la fecha de vencimiento')
      }
    } catch (error) {
      console.error('Error updating due date:', error)
      throw error
    }
  }

  const handleEditLoan = (loan: Loan) => {
    // TODO: Implement payment registration
    console.log('Edit loan (register payment):', loan)
  }

  const handleNewLoan = () => {
    router.push('/dashboard/loans/new')
  }

  const clearClientFilter = () => {
    router.push('/dashboard/loans')
  }

  // Get client name from first loan if filtering by client
  const getClientName = () => {
    if (clientId && loans.length > 0) {
      const client = loans[0].client
      return `${client.firstName} ${client.lastName}`
    }
    return null
  }

  return (
    <div className="space-y-4">
      {clientId && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <User className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            Mostrando préstamos de: <strong>{getClientName() || 'Cliente específico'}</strong>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearClientFilter}
            className="ml-auto h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4">
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
          
          <Button onClick={handleNewLoan} className="bg-[#FF5B67] hover:bg-[#FF4755] text-white">
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

      <LoanDetailsDrawer 
        loan={selectedLoan}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onUpdateDueDate={handleUpdateDueDate}
      />
    </div>
  )
}
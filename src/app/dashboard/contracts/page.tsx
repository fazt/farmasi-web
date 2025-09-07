'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileText, Calendar, DollarSign, Users } from 'lucide-react'
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
import { ContractsTable } from '@/components/contracts/contracts-table'

interface Contract {
  id: string
  startDate: Date
  endDate: Date
  amount: number
  interest: number
  installments: number
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  signature?: string | null
  createdAt: Date
  client: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
  }
  loan: {
    id: string
    amount: number
    weeklyPayment: number
    totalAmount: number
    status: string
    interestRate: {
      weeksCount: number
    }
    payments: any[]
  }
  guarantee: {
    id: string
    name: string
    value: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
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

  const fetchContracts = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: status,
      })

      const response = await fetch(`/api/contracts?${params}`)
      const data = await response.json()

      if (response.ok) {
        setContracts(data.contracts)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching contracts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const handleSearch = () => {
    fetchContracts(1, search, statusFilter === 'ALL' ? '' : statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    fetchContracts(1, search, status === 'ALL' ? '' : status)
  }


  const handleDeleteContract = async (id: string) => {
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchContracts(pagination.page, search, statusFilter === 'ALL' ? '' : statusFilter)
      } else {
        const error = await response.json()
        console.error('Error deleting contract:', error)
        alert(error.error || 'Error al eliminar el contrato')
      }
    } catch (error) {
      console.error('Error deleting contract:', error)
      alert('Error al eliminar el contrato')
    }
  }

  const handleEditContract = (contract: Contract) => {
    router.push(`/dashboard/contracts/${contract.id}/edit`)
  }

  const handleViewContract = (contract: Contract) => {
    // TODO: Implement contract detail view
    console.log('View contract:', contract)
  }

  const handleDownloadPDF = (contract: Contract) => {
    window.open(`/api/contracts/${contract.id}/pdf`, '_blank')
  }

  const handleSendEmail = (contract: Contract) => {
    // TODO: Implement email sending
    console.log('Send email for contract:', contract)
    alert('Funcionalidad de envío de email estará disponible próximamente')
  }

  const handleNewContract = () => {
    router.push('/dashboard/contracts/new')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  // Calculate statistics
  const stats = contracts.reduce(
    (acc, contract) => {
      acc.totalAmount += contract.amount
      acc.totalInterest += contract.interest
      acc.counts[contract.status] = (acc.counts[contract.status] || 0) + 1
      
      // Check if contract expires soon (within 2 weeks)
      const twoWeeksFromNow = new Date()
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)
      
      if (new Date(contract.endDate) <= twoWeeksFromNow && contract.status === 'ACTIVE') {
        acc.expiringSoon++
      }
      
      return acc
    },
    { 
      totalAmount: 0, 
      totalInterest: 0, 
      expiringSoon: 0,
      counts: {} as Record<string, number> 
    }
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground">
            Administra todos los contratos de préstamos del sistema
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contratos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
              <p className="text-xs text-muted-foreground">
                Contratos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Capital total contratado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contratos Activos
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.counts.ACTIVE || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                En ejecución
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vencen Próximamente
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.expiringSoon}
              </div>
              <p className="text-xs text-muted-foreground">
                En las próximas 2 semanas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completados</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.counts.COMPLETED || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cancelados</span>
                <span className="text-2xl font-bold text-red-600">
                  {stats.counts.CANCELLED || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Intereses Totales</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalInterest)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Contratos</CardTitle>
            <CardDescription>
              Busca y administra todos los contratos del sistema
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
                    <SelectItem value="COMPLETED">Completados</SelectItem>
                    <SelectItem value="CANCELLED">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleNewContract}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Contrato
                </Button>
              </div>
            </div>

            <ContractsTable
              contracts={contracts}
              onEdit={handleEditContract}
              onDelete={handleDeleteContract}
              onView={handleViewContract}
              onDownloadPDF={handleDownloadPDF}
              onSendEmail={handleSendEmail}
              isLoading={loading}
            />

            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchContracts(pagination.page - 1, search, statusFilter === 'ALL' ? '' : statusFilter)}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchContracts(pagination.page + 1, search, statusFilter === 'ALL' ? '' : statusFilter)}
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
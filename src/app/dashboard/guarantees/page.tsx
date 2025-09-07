'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Shield } from 'lucide-react'
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
import { GuaranteesTable } from '@/components/guarantees/guarantees-table'

interface Guarantee {
  id: string
  name: string
  value: number
  createdAt: Date
  _count: {
    loans: number
    contracts: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function GuaranteesPage() {
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const router = useRouter()

  const fetchGuarantees = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      })

      const response = await fetch(`/api/guarantees?${params}`)
      const data = await response.json()

      if (response.ok) {
        setGuarantees(data.guarantees)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching guarantees:', data.error)
      }
    } catch (error) {
      console.error('Error fetching guarantees:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuarantees()
  }, [])

  const handleSearch = () => {
    fetchGuarantees(1, search)
  }


  const handleDeleteGuarantee = async (id: string) => {
    try {
      const response = await fetch(`/api/guarantees/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchGuarantees(pagination.page, search)
      } else {
        const error = await response.json()
        console.error('Error deleting guarantee:', error)
        alert(error.error || 'Error al eliminar la garantía')
      }
    } catch (error) {
      console.error('Error deleting guarantee:', error)
      alert('Error al eliminar la garantía')
    }
  }

  const handleEditGuarantee = (guarantee: Guarantee) => {
    router.push(`/dashboard/guarantees/${guarantee.id}/edit`)
  }

  const handleViewGuarantee = (guarantee: Guarantee) => {
    // TODO: Implement guarantee detail view
    console.log('View guarantee:', guarantee)
  }

  const handleNewGuarantee = () => {
    router.push('/dashboard/guarantees/new')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  // Calculate statistics
  const stats = {
    totalValue: guarantees.reduce((acc, guarantee) => acc + Number(guarantee.value), 0),
    totalCount: guarantees.length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Garantías</h1>
          <p className="text-muted-foreground">
            Administra las garantías de los préstamos del sistema
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Garantías
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                Garantías registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Total
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total de garantías
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Garantías</CardTitle>
            <CardDescription>
              Busca y administra las garantías registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  placeholder="Buscar garantías..."
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
                <Button onClick={handleNewGuarantee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Garantía
                </Button>
              </div>
            </div>

            <GuaranteesTable
              guarantees={guarantees}
              onEdit={handleEditGuarantee}
              onDelete={handleDeleteGuarantee}
              onView={handleViewGuarantee}
              isLoading={loading}
            />

            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchGuarantees(pagination.page - 1, search)}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchGuarantees(pagination.page + 1, search)}
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
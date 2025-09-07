'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClientsTable } from '@/components/clients/clients-table'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  documentType?: string | null
  documentNumber?: string | null
  createdAt: Date
  _count: {
    loans: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface ClientsPageClientProps {
  initialClients: Client[]
  initialPagination: PaginationData
}

export function ClientsPageClient({ initialClients, initialPagination }: ClientsPageClientProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationData>(initialPagination)
  const router = useRouter()

  const fetchClients = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      })

      const response = await fetch(`/api/clients?${params}`)
      const data = await response.json()

      if (response.ok) {
        setClients(data.clients)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching clients:', data.error)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchClients(1, search)
  }

  const handleDeleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchClients(pagination.page, search)
      } else {
        const error = await response.json()
        console.error('Error deleting client:', error)
        alert(error.error || 'Error al eliminar el cliente')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Error al eliminar el cliente')
    }
  }

  const handleEditClient = (client: Client) => {
    router.push(`/dashboard/clients/${client.id}/edit`)
  }

  const handleViewClient = (client: Client) => {
    // TODO: Implement client detail view
    console.log('View client:', client)
  }

  const handleNewClient = () => {
    router.push('/dashboard/clients/new')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <ClientsTable
        clients={clients}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onView={handleViewClient}
        isLoading={loading}
      />

      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => fetchClients(pagination.page - 1, search)}
            disabled={pagination.page <= 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {pagination.page} de {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchClients(pagination.page + 1, search)}
            disabled={pagination.page >= pagination.pages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
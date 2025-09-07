'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { InterestRatesTable } from '@/components/interest-rates/interest-rates-table'

interface InterestRate {
  id: string
  loanAmount: number
  weeklyPayment: number
  weeksCount: number
  isActive: boolean
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

interface InterestRatesClientProps {
  initialRates: InterestRate[]
  initialPagination: PaginationData
}

export function InterestRatesClient({ initialRates, initialPagination }: InterestRatesClientProps) {
  const [interestRates, setInterestRates] = useState<InterestRate[]>(initialRates)
  const [loading, setLoading] = useState(false)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [pagination, setPagination] = useState<PaginationData>(initialPagination)
  const router = useRouter()

  const fetchInterestRates = async (page = 1, activeOnly = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        active: activeOnly.toString(),
      })

      const response = await fetch(`/api/interest-rates?${params}`)
      const data = await response.json()

      if (response.ok) {
        setInterestRates(data.interestRates)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching interest rates:', data.error)
      }
    } catch (error) {
      console.error('Error fetching interest rates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showActiveOnly) {
      fetchInterestRates(1, showActiveOnly)
    } else {
      setInterestRates(initialRates)
      setPagination(initialPagination)
    }
  }, [showActiveOnly, initialRates, initialPagination])

  const handleDeleteRate = async (id: string) => {
    try {
      const response = await fetch(`/api/interest-rates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchInterestRates(pagination.page, showActiveOnly)
      } else {
        const error = await response.json()
        console.error('Error deleting interest rate:', error)
        alert(error.error || 'Error al eliminar la tasa de interés')
      }
    } catch (error) {
      console.error('Error deleting interest rate:', error)
      alert('Error al eliminar la tasa de interés')
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const rate = interestRates.find(r => r.id === id)
      if (!rate) return

      const response = await fetch(`/api/interest-rates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanAmount: rate.loanAmount,
          weeklyPayment: rate.weeklyPayment,
          weeksCount: rate.weeksCount,
          isActive,
        }),
      })

      if (response.ok) {
        fetchInterestRates(pagination.page, showActiveOnly)
      } else {
        const error = await response.json()
        console.error('Error toggling status:', error)
        alert(error.error || 'Error al cambiar el estado')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Error al cambiar el estado')
    }
  }

  const handleEditRate = (rate: InterestRate) => {
    router.push(`/dashboard/interest-rates/${rate.id}/edit`)
  }

  const handleNewRate = () => {
    router.push('/dashboard/interest-rates/new')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Switch
            id="active-only"
            checked={showActiveOnly}
            onCheckedChange={setShowActiveOnly}
          />
          <Label htmlFor="active-only">Solo mostrar tasas activas</Label>
        </div>
        <Button onClick={handleNewRate} className="bg-[#FF5B67] hover:bg-[#FF4755] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tasa de Interés
        </Button>
      </div>

      <InterestRatesTable
        interestRates={interestRates}
        onEdit={handleEditRate}
        onDelete={handleDeleteRate}
        onToggleStatus={handleToggleStatus}
        isLoading={loading}
      />

      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => fetchInterestRates(pagination.page - 1, showActiveOnly)}
            disabled={pagination.page <= 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {pagination.page} de {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchInterestRates(pagination.page + 1, showActiveOnly)}
            disabled={pagination.page >= pagination.pages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
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

export default function InterestRatesPage() {
  const [interestRates, setInterestRates] = useState<InterestRate[]>([])
  const [loading, setLoading] = useState(true)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
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
    fetchInterestRates(1, showActiveOnly)
  }, [showActiveOnly])


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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasas de Interés</h1>
          <p className="text-muted-foreground">
            Administra las tasas de interés para los préstamos del sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Lista de Tasas de Interés
            </CardTitle>
            <CardDescription>
              Configura los montos de préstamo y pagos semanales correspondientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-only"
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                />
                <Label htmlFor="active-only">Solo mostrar tasas activas</Label>
              </div>
              <Button onClick={handleNewRate}>
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
          </CardContent>
        </Card>

        {/* Predefined rates information */}
        <Card>
          <CardHeader>
            <CardTitle>Tasas Predefinidas del Sistema</CardTitle>
            <CardDescription>
              Basado en los ejemplos del README, estas son las tasas de interés recomendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { amount: 500, payment: 105 },
                { amount: 600, payment: 110 },
                { amount: 700, payment: 145 },
                { amount: 800, payment: 165 },
                { amount: 1000, payment: 210 },
                { amount: 1500, payment: 320 },
              ].map((rate) => (
                <Card key={rate.amount} className="p-4">
                  <div className="text-center">
                    <div className="font-bold text-lg">S/. {rate.amount}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      S/. {rate.payment}/semana
                    </div>
                    <div className="text-xs">
                      {(((rate.payment * 6) - rate.amount) / rate.amount * 100).toFixed(1)}% interés
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
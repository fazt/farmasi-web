'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { InterestRateForm } from '@/components/interest-rates/interest-rate-form'
import { type InterestRateFormData } from '@/lib/validations/interest-rate'

interface EditInterestRatePageProps {
  params: Promise<{ id: string }>
}

interface InterestRate {
  id: string
  loanAmount: number
  weeklyPayment: number
  weeksCount: number
  isActive: boolean
  createdAt: Date
}

export default function EditInterestRatePage({ params }: EditInterestRatePageProps) {
  const [interestRate, setInterestRate] = useState<InterestRate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchInterestRate = async () => {
      try {
        const response = await fetch(`/api/interest-rates/${id}`)
        const data = await response.json()

        if (response.ok) {
          setInterestRate(data)
        } else {
          console.error('Error fetching interest rate:', data.error)
          alert('Error al cargar los datos de la tasa de interés')
          router.push('/dashboard/interest-rates')
        }
      } catch (error) {
        console.error('Error fetching interest rate:', error)
        alert('Error al cargar los datos de la tasa de interés')
        router.push('/dashboard/interest-rates')
      } finally {
        setLoading(false)
      }
    }

    fetchInterestRate()
  }, [id, router])

  const handleUpdateInterestRate = async (data: InterestRateFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/interest-rates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/interest-rates')
      } else {
        const error = await response.json()
        console.error('Error updating interest rate:', error)
        alert(error.error || 'Error al actualizar la tasa de interés')
      }
    } catch (error) {
      console.error('Error updating interest rate:', error)
      alert('Error al actualizar la tasa de interés')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/interest-rates')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Cargando datos de la tasa de interés...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!interestRate) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Tasa de interés no encontrada</p>
            <Button onClick={handleCancel} className="mt-4">
              Volver a Tasas de Interés
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Tasa de Interés</h1>
            <p className="text-muted-foreground">
              Modifica los valores de la tasa S/. {interestRate.loanAmount} - S/. {interestRate.weeklyPayment}/semana
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Tasa de Interés</CardTitle>
            <CardDescription>
              Actualiza los datos de la tasa de interés. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterestRateForm
              initialData={interestRate}
              onSubmit={handleUpdateInterestRate}
              isLoading={isSubmitting}
            />
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
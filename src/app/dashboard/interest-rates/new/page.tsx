'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { InterestRateForm } from '@/components/interest-rates/interest-rate-form'
import { type InterestRateFormData } from '@/lib/validations/interest-rate'

export default function NewInterestRatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateInterestRate = async (data: InterestRateFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/interest-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/interest-rates')
      } else {
        const error = await response.json()
        console.error('Error creating interest rate:', error)
        alert(error.error || 'Error al crear la tasa de interés')
      }
    } catch (error) {
      console.error('Error creating interest rate:', error)
      alert('Error al crear la tasa de interés')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/interest-rates')
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
            <h1 className="text-3xl font-bold tracking-tight">Nueva Tasa de Interés</h1>
            <p className="text-muted-foreground">
              Configura una nueva tasa de interés para préstamos
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Tasa de Interés</CardTitle>
            <CardDescription>
              Define el monto del préstamo, pago semanal y duración. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterestRateForm
              onSubmit={handleCreateInterestRate}
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
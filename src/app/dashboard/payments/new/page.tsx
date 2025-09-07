'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PaymentForm } from '@/components/payments/payment-form'
import { type PaymentFormData } from '@/lib/validations/payment'

export default function NewPaymentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreatePayment = async (data: PaymentFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/payments')
      } else {
        const error = await response.json()
        console.error('Error creating payment:', error)
        alert(error.error || 'Error al registrar el pago')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Error al registrar el pago')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/payments')
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
            <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Pago</h1>
            <p className="text-muted-foreground">
              Busca el préstamo del cliente y registra el pago recibido
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Pago</CardTitle>
            <CardDescription>
              Completa los datos del pago. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm
              onSubmit={handleCreatePayment}
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
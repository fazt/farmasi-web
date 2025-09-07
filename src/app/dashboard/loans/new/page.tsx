'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoanForm } from '@/components/loans/loan-form'

export default function NewLoanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateLoan = async (data: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/loans')
      } else {
        const error = await response.json()
        console.error('Error creating loan:', error)
        alert(error.error || 'Error al crear el préstamo')
      }
    } catch (error) {
      console.error('Error creating loan:', error)
      alert('Error al crear el préstamo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/loans')
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
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Préstamo</h1>
            <p className="text-muted-foreground">
              Crea un nuevo préstamo seleccionando cliente, tasa de interés y garantía
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Préstamo</CardTitle>
            <CardDescription>
              Completa los datos del nuevo préstamo. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoanForm
              onSubmit={handleCreateLoan}
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
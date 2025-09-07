'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GuaranteeForm } from '@/components/guarantees/guarantee-form'
import { type GuaranteeFormData } from '@/lib/validations/guarantee'

export default function NewGuaranteePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateGuarantee = async (data: GuaranteeFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/guarantees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/guarantees')
      } else {
        const error = await response.json()
        console.error('Error creating guarantee:', error)
        alert(error.error || 'Error al crear la garantía')
      }
    } catch (error) {
      console.error('Error creating guarantee:', error)
      alert('Error al crear la garantía')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/guarantees')
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
            <h1 className="text-3xl font-bold tracking-tight">Nueva Garantía</h1>
            <p className="text-muted-foreground">
              Registra una nueva garantía en el sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Garantía</CardTitle>
            <CardDescription>
              Completa los datos de la nueva garantía. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GuaranteeForm
              onSubmit={handleCreateGuarantee}
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
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ContractForm } from '@/components/contracts/contract-form'
import { type ContractFormData } from '@/lib/validations/contract'

export default function NewContractPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateContract = async (data: ContractFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/contracts')
      } else {
        const error = await response.json()
        console.error('Error creating contract:', error)
        alert(error.error || 'Error al crear el contrato')
      }
    } catch (error) {
      console.error('Error creating contract:', error)
      alert('Error al crear el contrato')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/contracts')
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
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Contrato</h1>
            <p className="text-muted-foreground">
              Busca un préstamo y genera el contrato correspondiente
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Contrato</CardTitle>
            <CardDescription>
              Completa los datos del contrato. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractForm
              onSubmit={handleCreateContract}
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
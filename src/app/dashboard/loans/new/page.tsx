'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoanForm } from '@/components/loans/loan-form'
import { useToast } from '@/hooks/use-toast'

export default function NewLoanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateLoan = async (data: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Préstamo creado",
          description: "El préstamo se ha creado exitosamente",
        })
        router.push('/dashboard/loans')
      } else {
        const error = await response.json()
        console.error('Error creating loan:', error)
        
        // Check if the error is about active loan
        if (error.error?.includes('activo') || error.error?.includes('active')) {
          toast({
            title: "Cliente con préstamo activo",
            description: error.error || "Este cliente ya tiene un préstamo activo. Debe completar el préstamo actual antes de solicitar uno nuevo.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error al crear préstamo",
            description: error.error || 'Ha ocurrido un error al crear el préstamo',
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Error creating loan:', error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/loans')
  }

  const handleDataLoaded = () => {
    setIsLoading(false)
  }


  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-10rem)]">
        <div className="flex items-center gap-4 mb-6">
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

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
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
                  renderSkeleton={isLoading}
                  onDataLoaded={handleDataLoaded}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
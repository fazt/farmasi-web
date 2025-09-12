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
      console.log('Enviando datos de garantía:', data)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('value', data.value.toString())
      
      // Add description if provided
      if (data.description) {
        formData.append('description', data.description)
      }
      
      // Add photos to FormData
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo)
        })
      }
      
      const response = await fetch('/api/guarantees', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        console.log('Garantía creada exitosamente')
        router.push('/dashboard/guarantees')
      } else {
        const error = await response.json()
        console.error('Error del servidor:', error)
        
        // Mostrar error más detallado
        if (error.error) {
          alert(`Error: ${error.error}`)
        } else if (error.message) {
          alert(`Error: ${error.message}`)
        } else {
          alert('Error al crear la garantía. Verifique los datos.')
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      alert('Error de conexión. Verifique su internet e intente nuevamente.')
      throw error // Re-throw para que el formulario pueda manejarlo
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Información de la Garantía</CardTitle>
                <CardDescription>
                  Completa los datos de la nueva garantía. Los campos marcados con (*) son obligatorios.
                </CardDescription>
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="guarantee-form"
                  disabled={isSubmitting}
                  className="bg-[#FF5B67] hover:bg-[#FF4755] text-white"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Garantía'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <GuaranteeForm
              onSubmit={handleCreateGuarantee}
              isLoading={isSubmitting}
              formId="guarantee-form"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
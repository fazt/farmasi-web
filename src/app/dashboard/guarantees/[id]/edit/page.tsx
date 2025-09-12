'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GuaranteeForm } from '@/components/guarantees/guarantee-form'
import { type GuaranteeFormData } from '@/lib/validations/guarantee'

interface EditGuaranteePageProps {
  params: Promise<{ id: string }>
}

interface Guarantee {
  id: string
  name: string
  value: number
  photo?: string | null
  description?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'USED'
  createdAt: Date
}

export default function EditGuaranteePage({ params }: EditGuaranteePageProps) {
  const [guarantee, setGuarantee] = useState<Guarantee | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchGuarantee = async () => {
      try {
        const response = await fetch(`/api/guarantees/${id}`)
        const data = await response.json()

        if (response.ok) {
          setGuarantee(data)
        } else {
          console.error('Error fetching guarantee:', data.error)
          alert('Error al cargar los datos de la garantía')
          router.push('/dashboard/guarantees')
        }
      } catch (error) {
        console.error('Error fetching guarantee:', error)
        alert('Error al cargar los datos de la garantía')
        router.push('/dashboard/guarantees')
      } finally {
        setLoading(false)
      }
    }

    fetchGuarantee()
  }, [id, router])

  const handleUpdateGuarantee = async (data: GuaranteeFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/guarantees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/guarantees')
      } else {
        const error = await response.json()
        console.error('Error updating guarantee:', error)
        alert(error.error || 'Error al actualizar la garantía')
      }
    } catch (error) {
      console.error('Error updating guarantee:', error)
      alert('Error al actualizar la garantía')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/guarantees')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Cargando datos de la garantía...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!guarantee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Garantía no encontrada</p>
            <Button onClick={handleCancel} className="mt-4">
              Volver a Garantías
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
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
            <h1 className="text-3xl font-bold tracking-tight">Editar Garantía</h1>
            <p className="text-muted-foreground">
              Modifica la información de "{guarantee.name}" - {formatCurrency(guarantee.value)}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Garantía</CardTitle>
            <CardDescription>
              Actualiza los datos de la garantía. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GuaranteeForm
              initialData={guarantee}
              onSubmit={handleUpdateGuarantee}
              isLoading={isSubmitting}
              formId="guarantee-form"
            />
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
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
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
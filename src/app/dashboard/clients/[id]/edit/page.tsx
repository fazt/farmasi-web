'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ClientForm } from '@/components/clients/client-form'
import { type ClientFormData } from '@/lib/validations/client'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  documentType?: string | null
  documentNumber?: string | null
  birthDate?: Date | null
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | null
  occupation?: string | null
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`)
        const data = await response.json()

        if (response.ok) {
          setClient(data)
        } else {
          console.error('Error fetching client:', data.error)
          alert('Error al cargar los datos del cliente')
          router.push('/dashboard/clients')
        }
      } catch (error) {
        console.error('Error fetching client:', error)
        alert('Error al cargar los datos del cliente')
        router.push('/dashboard/clients')
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [id, router])

  const handleUpdateClient = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/clients')
      } else {
        const error = await response.json()
        console.error('Error updating client:', error)
        alert(error.error || 'Error al actualizar el cliente')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Error al actualizar el cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/clients')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Cargando datos del cliente...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Cliente no encontrado</p>
            <Button onClick={handleCancel} className="mt-4">
              Volver a Clientes
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
            <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
            <p className="text-muted-foreground">
              Modifica la información de {client.firstName} {client.lastName}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>
                  Actualiza los datos del cliente. Los campos marcados con (*) son obligatorios.
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
                  form="client-form"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Cliente'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClientForm
              initialData={client}
              onSubmit={handleUpdateClient}
              isLoading={isSubmitting}
              formId="client-form"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
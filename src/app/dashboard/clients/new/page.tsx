'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ClientForm } from '@/components/clients/client-form'
import { type ClientFormData } from '@/lib/validations/client'

export default function NewClientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateClient = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/clients')
      } else {
        const error = await response.json()
        console.error('Error creating client:', error)
        alert(error.error || 'Error al crear el cliente')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Error al crear el cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/clients')
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
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
            <p className="text-muted-foreground">
              Registra un nuevo cliente en el sistema
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registro de Cliente</CardTitle>
                  <CardDescription>
                    Complete la información del cliente usando las pestañas disponibles
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
                    className="bg-[#FF5B67] hover:bg-[#FF4755] text-white"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="required" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="required" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información Requerida
                  </TabsTrigger>
                  <TabsTrigger value="extra" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Información Extra
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="required" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Información Requerida</h3>
                      <p className="text-sm text-muted-foreground">
                        Datos básicos necesarios para el registro del cliente. Los campos marcados con (*) son obligatorios.
                      </p>
                    </div>
                    <ClientForm
                      onSubmit={handleCreateClient}
                      isLoading={isSubmitting}
                      formId="client-form"
                      section="required"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="extra" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Información Extra</h3>
                      <p className="text-sm text-muted-foreground">
                        Información adicional y de contacto del cliente (opcional).
                      </p>
                    </div>
                    <ClientForm
                      onSubmit={handleCreateClient}
                      isLoading={isSubmitting}
                      formId="client-form"
                      section="extra"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UserForm } from '@/components/users/user-form'

export default function NewUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateUser = async (data: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/users')
      } else {
        const error = await response.json()
        console.error('Error creating user:', error)
        alert(error.error || 'Error al crear el usuario')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/users')
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
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h1>
            <p className="text-muted-foreground">
              Crea un nuevo usuario para el sistema
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
                <CardDescription>
                  Completa los datos del nuevo usuario. Los campos marcados con (*) son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserForm
                  onSubmit={handleCreateUser}
                  isLoading={isSubmitting}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
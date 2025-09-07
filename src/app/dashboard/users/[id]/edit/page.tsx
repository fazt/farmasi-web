'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UserForm } from '@/components/users/user-form'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          console.error('Error fetching user')
          router.push('/dashboard/users')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/dashboard/users')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id, router])

  const handleUpdateUser = async (data: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/users')
      } else {
        const error = await response.json()
        console.error('Error updating user:', error)
        alert(error.error || 'Error al actualizar el usuario')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/users')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div>Cargando usuario...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div>Usuario no encontrado</div>
        </div>
      </DashboardLayout>
    )
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
            <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
            <p className="text-muted-foreground">
              Actualiza la información del usuario {user.name}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
                <CardDescription>
                  Actualiza los datos del usuario. Los campos marcados con (*) son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserForm
                  onSubmit={handleUpdateUser}
                  isLoading={isSubmitting}
                  defaultValues={user}
                  isEditMode={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
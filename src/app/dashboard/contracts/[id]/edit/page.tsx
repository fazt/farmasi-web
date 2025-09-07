'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ContractForm } from '@/components/contracts/contract-form'
import { type ContractFormData } from '@/lib/validations/contract'

interface EditContractPageProps {
  params: Promise<{ id: string }>
}

interface Contract {
  id: string
  startDate: Date
  endDate: Date
  amount: number
  interest: number
  installments: number
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  signature?: string | null
  createdAt: Date
  client: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
  }
  loan: {
    id: string
    amount: number
    weeklyPayment: number
    totalAmount: number
    status: string
    interestRate: {
      weeksCount: number
    }
    payments: any[]
  }
  guarantee: {
    id: string
    name: string
    value: number
  }
}

export default function EditContractPage({ params }: EditContractPageProps) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${id}`)
        const data = await response.json()

        if (response.ok) {
          setContract(data)
        } else {
          console.error('Error fetching contract:', data.error)
          alert('Error al cargar los datos del contrato')
          router.push('/dashboard/contracts')
        }
      } catch (error) {
        console.error('Error fetching contract:', error)
        alert('Error al cargar los datos del contrato')
        router.push('/dashboard/contracts')
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }, [id, router])

  const handleUpdateContract = async (data: ContractFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/contracts')
      } else {
        const error = await response.json()
        console.error('Error updating contract:', error)
        alert(error.error || 'Error al actualizar el contrato')
      }
    } catch (error) {
      console.error('Error updating contract:', error)
      alert('Error al actualizar el contrato')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/contracts')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Cargando datos del contrato...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!contract) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Contrato no encontrado</p>
            <Button onClick={handleCancel} className="mt-4">
              Volver a Contratos
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
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
            <h1 className="text-3xl font-bold tracking-tight">Editar Contrato</h1>
            <p className="text-muted-foreground">
              Contrato de {contract.client.firstName} {contract.client.lastName} - {formatCurrency(contract.amount)} ({formatDate(contract.startDate)})
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Contrato</CardTitle>
            <CardDescription>
              Actualiza los datos del contrato. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractForm
              initialData={contract}
              onSubmit={handleUpdateContract}
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
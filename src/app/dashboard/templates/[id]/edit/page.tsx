'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { WhatsAppTemplateForm } from '@/components/whatsapp-templates/whatsapp-template-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type TemplateType = 'whatsapp' | 'contract'

interface Template {
  id: string
  type: TemplateType
  title: string
  name?: string
  content: string
  richContent?: string
  category?: string
  variables: string[]
  metadata?: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface EditTemplatePageProps {
  params: {
    id: string
  }
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setTemplate(data.template)
        } else {
          console.error('Error fetching template')
          router.push('/dashboard/templates')
        }
      } catch (error) {
        console.error('Error fetching template:', error)
        router.push('/dashboard/templates')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id, router])

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard/templates')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar la plantilla')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/templates')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-96 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-medium">Plantilla no encontrada</h2>
            <p className="text-muted-foreground">La plantilla que buscas no existe.</p>
            <Button onClick={handleCancel} className="mt-4">
              Volver a Plantillas
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
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Plantilla {template.type === 'contract' ? 'de Contrato' : 'WhatsApp'}
            </h1>
            <p className="text-muted-foreground">
              Modifica la plantilla {template.type === 'contract' ? 'de contrato' : 'de mensaje WhatsApp'}
            </p>
          </div>
        </div>

        <div className="max-w-4xl">
          <WhatsAppTemplateForm
            initialData={template}
            onSubmit={handleSubmit}
            templateType={template.type}
            isLoading={false}
          />
          
          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
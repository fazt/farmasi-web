'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { WhatsAppTemplatesTable } from '@/components/whatsapp-templates/whatsapp-templates-table'
import { WhatsAppTemplateForm } from '@/components/whatsapp-templates/whatsapp-template-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface WhatsAppTemplate {
  id: string
  name: string
  content: string
  variables: string[]
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const router = useRouter()

  const fetchTemplates = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      })

      const response = await fetch(`/api/whatsapp-templates?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTemplates(data.templates)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching templates:', data.error)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleSearch = () => {
    fetchTemplates(1, search)
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/whatsapp-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTemplates(pagination.page, search)
      } else {
        const error = await response.json()
        console.error('Error deleting template:', error)
        alert(error.error || 'Error al eliminar la plantilla')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error al eliminar la plantilla')
    }
  }

  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setShowForm(true)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      const url = editingTemplate 
        ? `/api/whatsapp-templates/${editingTemplate.id}`
        : '/api/whatsapp-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingTemplate(null)
        fetchTemplates(pagination.page, search)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la plantilla')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      throw error
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/whatsapp-templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchTemplates(pagination.page, search)
      } else {
        const error = await response.json()
        console.error('Error updating template status:', error)
        alert(error.error || 'Error al cambiar el estado de la plantilla')
      }
    } catch (error) {
      console.error('Error updating template status:', error)
      alert('Error al cambiar el estado de la plantilla')
    }
  }

  // Calculate statistics
  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.isActive).length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plantillas WhatsApp</h1>
          <p className="text-muted-foreground">
            Administra las plantillas de mensajes automáticos para WhatsApp
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Plantillas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">
                Plantillas registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Plantillas Activas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeTemplates}
              </div>
              <p className="text-xs text-muted-foreground">
                Plantillas en uso
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Plantillas</CardTitle>
            <CardDescription>
              Busca y administra las plantillas de mensajes WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  placeholder="Buscar plantillas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="max-w-sm"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={handleNewTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
            </div>

            <WhatsAppTemplatesTable
              templates={templates}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onToggleStatus={handleToggleStatus}
              isLoading={loading}
            />

            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchTemplates(pagination.page - 1, search)}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchTemplates(pagination.page + 1, search)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </DialogTitle>
            </DialogHeader>
            <WhatsAppTemplateForm
              initialData={editingTemplate || undefined}
              onSubmit={handleFormSubmit}
              isLoading={false}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
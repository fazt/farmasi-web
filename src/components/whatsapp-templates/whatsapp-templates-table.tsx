'use client'

import { useState } from 'react'
import { Edit, Trash2, MoreHorizontal, Power, PowerOff, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'

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

interface WhatsAppTemplatesTableProps {
  templates: WhatsAppTemplate[]
  onEdit: (template: WhatsAppTemplate) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  isLoading: boolean
}

export function WhatsAppTemplatesTable({
  templates,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading,
}: WhatsAppTemplatesTableProps) {
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null)

  const handleDelete = (template: WhatsAppTemplate) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la plantilla "${template.name}"?`)) {
      onDelete(template.id)
    }
  }

  const handlePreview = (template: WhatsAppTemplate) => {
    setPreviewTemplate(template)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recordatorio':
        return 'default'
      case 'confirmacion':
        return 'secondary'
      case 'promocion':
        return 'outline'
      case 'bienvenida':
        return 'default'
      default:
        return 'secondary'
    }
  }

  // Preview component to show template with sample data
  const renderPreview = (template: WhatsAppTemplate) => {
    let previewContent = template.content

    // Replace common variables with sample data
    template.variables.forEach((variable) => {
      const sampleData: { [key: string]: string } = {
        nombre: 'Juan Pérez',
        monto: 'S/ 1,000.00',
        fecha: '15/01/2024',
        fechaVencimiento: '22/01/2024',
        semana: '3',
        saldo: 'S/ 500.00',
        empresa: 'Farmasi'
      }
      
      previewContent = previewContent.replace(
        new RegExp(`{{${variable}}}`, 'g'), 
        sampleData[variable] || `[${variable}]`
      )
    })

    return previewContent
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">No hay plantillas registradas</h3>
            <p className="text-muted-foreground">
              Comienza creando tu primera plantilla de mensaje WhatsApp
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div>{template.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {template.content.substring(0, 100)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getCategoryBadgeVariant(template.category)}>
                    {template.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.length > 0 ? (
                      template.variables.slice(0, 2).map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin variables</span>
                    )}
                    {template.variables.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(template.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(template)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Vista Previa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(template)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onToggleStatus(template.id, template.isActive)}
                      >
                        {template.isActive ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(template)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Previa: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <div className="text-sm text-green-600 font-medium mb-2">
                Mensaje WhatsApp (Ejemplo)
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {previewTemplate && renderPreview(previewTemplate)}
              </div>
            </div>
            
            {previewTemplate && previewTemplate.variables.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Variables disponibles:</div>
                <div className="flex flex-wrap gap-1">
                  {previewTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
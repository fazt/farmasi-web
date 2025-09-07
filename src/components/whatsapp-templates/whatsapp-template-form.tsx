'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { X, Plus } from 'lucide-react'
import { useState } from 'react'

const whatsappTemplateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Seleccione una categoría'),
  isActive: z.boolean().default(true),
})

type WhatsAppTemplateFormData = z.infer<typeof whatsappTemplateSchema>

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

interface WhatsAppTemplateFormProps {
  initialData?: Partial<WhatsAppTemplate>
  onSubmit: (data: WhatsAppTemplateFormData & { variables: string[] }) => Promise<void>
  isLoading?: boolean
  formId?: string
}

const templateCategories = [
  { value: 'recordatorio', label: 'Recordatorio de Pago' },
  { value: 'confirmacion', label: 'Confirmación' },
  { value: 'bienvenida', label: 'Bienvenida' },
  { value: 'promocion', label: 'Promoción' },
  { value: 'notificacion', label: 'Notificación' },
  { value: 'otros', label: 'Otros' },
]

const commonVariables = [
  'nombre',
  'monto',
  'fecha',
  'fechaVencimiento', 
  'semana',
  'saldo',
  'empresa',
  'telefono',
  'cuota'
]

export function WhatsAppTemplateForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  formId 
}: WhatsAppTemplateFormProps) {
  const [variables, setVariables] = useState<string[]>(initialData?.variables || [])
  const [newVariable, setNewVariable] = useState('')

  const form = useForm<WhatsAppTemplateFormData>({
    resolver: zodResolver(whatsappTemplateSchema),
    defaultValues: {
      name: initialData?.name || '',
      content: initialData?.content || '',
      category: initialData?.category || '',
      isActive: initialData?.isActive ?? true,
    },
  })

  // Extract variables from content using {{variable}} pattern
  const extractVariables = (content: string) => {
    const variableRegex = /\{\{(\w+)\}\}/g
    const matches = content.match(variableRegex) || []
    const extractedVariables = matches.map(match => match.replace(/[{}]/g, ''))
    return [...new Set(extractedVariables)] // Remove duplicates
  }

  const handleContentChange = (content: string) => {
    const extractedVariables = extractVariables(content)
    setVariables(extractedVariables)
  }

  const addVariable = (variableName: string) => {
    if (variableName && !variables.includes(variableName)) {
      const currentContent = form.getValues('content')
      const newContent = currentContent + ` {{${variableName}}}`
      form.setValue('content', newContent)
      setVariables([...variables, variableName])
    }
    setNewVariable('')
  }

  const addCommonVariable = (variableName: string) => {
    if (!variables.includes(variableName)) {
      const currentContent = form.getValues('content')
      const newContent = currentContent + ` {{${variableName}}}`
      form.setValue('content', newContent)
      setVariables([...variables, variableName])
    }
  }

  const removeVariable = (variableName: string) => {
    const currentContent = form.getValues('content')
    const newContent = currentContent.replace(new RegExp(`\\{\\{${variableName}\\}\\}`, 'g'), '')
    form.setValue('content', newContent)
    setVariables(variables.filter(v => v !== variableName))
  }

  const handleSubmit = async (data: WhatsAppTemplateFormData) => {
    try {
      await onSubmit({ ...data, variables })
    } catch (error) {
      console.error('Error submitting form:', error)
      
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('Error al guardar la plantilla. Revise los datos e intente nuevamente.')
      }
    }
  }

  // Sample preview
  const renderPreview = () => {
    const content = form.watch('content')
    if (!content) return ''

    let previewContent = content
    variables.forEach((variable) => {
      const sampleData: { [key: string]: string } = {
        nombre: 'Juan Pérez',
        monto: 'S/ 1,000.00',
        fecha: '15/01/2024',
        fechaVencimiento: '22/01/2024',
        semana: '3',
        saldo: 'S/ 500.00',
        empresa: 'Farmasi',
        telefono: '987654321',
        cuota: 'S/ 200.00'
      }
      
      previewContent = previewContent.replace(
        new RegExp(`{{${variable}}}`, 'g'), 
        sampleData[variable] || `[${variable}]`
      )
    })

    return previewContent
  }

  return (
    <Form {...form}>
      <form 
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Plantilla *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Recordatorio de Pago Semanal" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre identificativo de la plantilla
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templateCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado Activo</FormLabel>
                    <FormDescription>
                      La plantilla estará disponible para uso
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido del Mensaje *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hola {{nombre}}, te recordamos que tienes un pago pendiente de {{monto}} con vencimiento el {{fechaVencimiento}}..."
                      className="min-h-[120px]"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleContentChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Use {'{{variable}}'} para insertar datos dinámicos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Variables Section */}
            <div className="space-y-3">
              <div>
                <FormLabel>Variables Detectadas</FormLabel>
                <div className="flex flex-wrap gap-1 mt-2">
                  {variables.map((variable) => (
                    <Badge 
                      key={variable} 
                      variant="secondary" 
                      className="px-2 py-1 flex items-center gap-1"
                    >
                      {variable}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeVariable(variable)}
                      />
                    </Badge>
                  ))}
                  {variables.length === 0 && (
                    <span className="text-muted-foreground text-sm">
                      No hay variables en el contenido
                    </span>
                  )}
                </div>
              </div>

              <div>
                <FormLabel>Variables Comunes</FormLabel>
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonVariables.map((variable) => (
                    <Button
                      key={variable}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => addCommonVariable(variable)}
                      disabled={variables.includes(variable)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {variable}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Nueva variable"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addVariable(newVariable)
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addVariable(newVariable)}
                  disabled={!newVariable || variables.includes(newVariable)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {form.watch('content') && (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <FormLabel>Vista Previa</FormLabel>
                <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-2">
                    Mensaje WhatsApp (Ejemplo)
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
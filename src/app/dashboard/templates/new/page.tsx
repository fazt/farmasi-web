'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'

type TemplateType = 'whatsapp' | 'contract'

const contractCategories = [
  { value: 'prestamo', label: 'Préstamo Personal' },
  { value: 'garantia', label: 'Garantía' },
  { value: 'pagos', label: 'Términos de Pago' },
  { value: 'legal', label: 'Legal' },
  { value: 'general', label: 'General' },
]

const contractVariables = [
  'nombreCliente',
  'documentoCliente',
  'direccionCliente',
  'montoCredito',
  'tasaInteres',
  'fechaInicio',
  'fechaVencimiento',
  'cuotaSemanal',
  'nombreGarante',
  'documentoGarante',
  'fechaContrato',
  'numeroContrato'
]

export default function NewTemplatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateType = (searchParams.get('type') as TemplateType) || 'contract'
  
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [richContent, setRichContent] = useState('')
  const [content, setContent] = useState('')
  const [variables, setVariables] = useState<string[]>([])
  const [newVariable, setNewVariable] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const isContract = templateType === 'contract'

  // Extract variables from content using {{variable}} pattern
  const extractVariables = (text: string) => {
    const variableRegex = /\{\{(\w+)\}\}/g
    const matches = text.match(variableRegex) || []
    const extractedVariables = matches.map(match => match.replace(/[{}]/g, ''))
    return [...new Set(extractedVariables)]
  }

  const handleContentChange = (newContent: string) => {
    setRichContent(newContent)
    const extractedVariables = extractVariables(newContent)
    setVariables(extractedVariables)
  }

  const addCommonVariable = (variableName: string) => {
    if (!variables.includes(variableName)) {
      const newContent = richContent + ` {{${variableName}}}`
      setRichContent(newContent)
      setVariables([...variables, variableName])
    }
  }

  const addCustomVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      const newContent = richContent + ` {{${newVariable}}}`
      setRichContent(newContent)
      setVariables([...variables, newVariable])
      setNewVariable('')
    }
  }

  const removeVariable = (variableName: string) => {
    const newContent = richContent.replace(new RegExp(`\\{\\{${variableName}\\}\\}`, 'g'), '')
    setRichContent(newContent)
    setVariables(variables.filter(v => v !== variableName))
  }

  const handleSubmit = async () => {
    if (!title.trim() || (!richContent.trim() && !content.trim())) {
      alert('Por favor complete los campos requeridos')
      return
    }

    try {
      setIsLoading(true)
      const templateData = {
        type: templateType.toUpperCase(),
        title,
        content: content || richContent,
        richContent: isContract ? richContent : undefined,
        category: category || undefined,
        variables,
        isActive
      }

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        router.push('/dashboard/templates')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la plantilla')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error al guardar la plantilla')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/templates')
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  Nueva Plantilla {isContract ? 'de Contrato' : 'WhatsApp'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {title || 'Sin título'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 border rounded-lg">
            {isContract ? (
              <RichTextEditor
                content={richContent}
                onChange={handleContentChange}
                placeholder="Escribe el contenido de tu contrato aquí..."
                className="h-full"
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido de tu mensaje WhatsApp aquí..."
                className="h-full resize-none"
              />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-muted/20 p-6 space-y-6 overflow-y-auto">
          {/* Template Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isContract ? "Ej: Contrato de Préstamo Personal" : "Ej: Recordatorio de Pago"}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Plantilla activa</Label>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>

          {/* Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detected Variables */}
              <div>
                <Label className="text-sm font-medium">Detectadas</Label>
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
                      No hay variables detectadas
                    </span>
                  )}
                </div>
              </div>

              {/* Common Variables */}
              <div>
                <Label className="text-sm font-medium">Variables Comunes</Label>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {contractVariables.slice(0, 8).map((variable) => (
                    <Button
                      key={variable}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs justify-start"
                      onClick={() => addCommonVariable(variable)}
                      disabled={variables.includes(variable)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {variable}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Variable */}
              <div>
                <Label className="text-sm font-medium">Agregar Variable</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="nombreVariable"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomVariable()
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomVariable}
                    disabled={!newVariable || variables.includes(newVariable)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(richContent || content) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded p-3 bg-background text-sm">
                  {isContract && richContent ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: richContent }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {content || richContent}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
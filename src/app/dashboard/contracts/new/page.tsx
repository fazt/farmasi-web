'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Eye, Check, Camera, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ContractForm } from '@/components/contracts/contract-form'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { type ContractFormData } from '@/lib/validations/contract'

interface Template {
  id: string
  title: string
  content: string
  richContent?: string
  category?: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function NewContractPage() {
  const [step, setStep] = useState<'template' | 'id-upload' | 'contract'>('template')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [idPhotos, setIdPhotos] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null
  })
  const router = useRouter()

  // Load templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true)
        const response = await fetch('/api/templates?type=contract&limit=50')
        const data = await response.json()
        
        if (response.ok) {
          setTemplates(data.templates)
        } else {
          console.error('Error loading templates:', data.error)
        }
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [])

  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
  }

  const handleUseTemplate = () => {
    setStep('id-upload')
  }

  const handleCreateContract = async (data: ContractFormData) => {
    setIsSubmitting(true)
    try {
      // Create FormData to include files
      const formData = new FormData()
      
      // Add contract data
      const contractData = {
        ...data,
        templateId: selectedTemplate?.id,
        content: selectedTemplate ? selectedTemplate.richContent || selectedTemplate.content : data.content
      }
      
      // Add contract data as JSON
      formData.append('contractData', JSON.stringify(contractData))
      
      // Add ID photos
      if (idPhotos.front) {
        formData.append('idPhotoFront', idPhotos.front)
      }
      if (idPhotos.back) {
        formData.append('idPhotoBack', idPhotos.back)
      }
      
      const response = await fetch('/api/contracts', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        router.push('/dashboard/contracts')
      } else {
        const error = await response.json()
        console.error('Error creating contract:', error)
        alert(error.error || 'Error al crear el contrato')
      }
    } catch (error) {
      console.error('Error creating contract:', error)
      alert('Error al crear el contrato')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (step === 'contract') {
      setStep('id-upload')
    } else if (step === 'id-upload') {
      setStep('template')
    } else {
      router.push('/dashboard/contracts')
    }
  }

  const handleSkipTemplate = () => {
    setSelectedTemplate(null)
    setStep('id-upload')
  }

  const handleIdPhotosComplete = () => {
    if (idPhotos.front && idPhotos.back) {
      setStep('contract')
    } else {
      alert('Por favor, suba ambas fotos del DNI (frontal y trasera)')
    }
  }

  const getCategoryLabel = (category?: string) => {
    const categories: { [key: string]: string } = {
      'prestamo': 'Préstamo Personal',
      'garantia': 'Garantía',
      'pagos': 'Términos de Pago',
      'legal': 'Legal',
      'general': 'General',
    }
    return category ? categories[category] || category : 'Sin categoría'
  }

  if (step === 'template') {
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Nuevo Contrato</h1>
              <p className="text-muted-foreground">
                Selecciona una plantilla de contrato o continúa sin plantilla
              </p>
            </div>
            <Button variant="outline" onClick={handleSkipTemplate}>
              Continuar sin Plantilla
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Plantillas de Contratos
                  </CardTitle>
                  <CardDescription>
                    Selecciona una plantilla para usar como base para tu contrato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Buscar plantillas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />

                    {loadingTemplates ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron plantillas que coincidan' : 'No hay plantillas disponibles'}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {filteredTemplates.map((template) => (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedTemplate?.id === template.id
                                ? 'ring-2 ring-primary bg-primary/5'
                                : ''
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium truncate">{template.title}</h3>
                                    {selectedTemplate?.id === template.id && (
                                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {template.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {getCategoryLabel(template.category)}
                                      </Badge>
                                    )}
                                    <Badge 
                                      variant={template.isActive ? 'default' : 'secondary'} 
                                      className="text-xs"
                                    >
                                      {template.isActive ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                  </div>
                                  {template.variables.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Variables: {template.variables.length}
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {template.variables.slice(0, 3).map((variable) => (
                                          <code key={variable} className="text-xs bg-muted px-1 rounded">
                                            {`{{${variable}}}`}
                                          </code>
                                        ))}
                                        {template.variables.length > 3 && (
                                          <span className="text-xs text-muted-foreground">
                                            +{template.variables.length - 3} más
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">{selectedTemplate.title}</h3>
                        {selectedTemplate.category && (
                          <Badge variant="secondary">
                            {getCategoryLabel(selectedTemplate.category)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="border rounded p-3 bg-background max-h-[400px] overflow-y-auto">
                        <div 
                          className="prose prose-sm max-w-none text-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: selectedTemplate.richContent || selectedTemplate.content 
                          }}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleUseTemplate}
                        className="w-full"
                      >
                        Usar esta Plantilla
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Selecciona una plantilla para ver la vista previa</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (step === 'id-upload') {
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Verificación de Identidad</h1>
              <p className="text-muted-foreground">
                Sube las fotos del DNI del cliente para verificar su identidad
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Documento Nacional de Identidad (DNI)
              </CardTitle>
              <CardDescription>
                Por favor, sube fotos claras y legibles del DNI del cliente. Se requieren ambos lados del documento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DNI Front Photo */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Foto Frontal del DNI
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sube una foto clara del lado frontal del DNI donde se vea la foto y los datos personales del cliente.
                </p>
                <PhotoUpload
                  photos={idPhotos.front ? [idPhotos.front] : []}
                  onPhotosChange={(photos) => {
                    setIdPhotos(prev => ({ ...prev, front: photos[0] || null }))
                  }}
                  maxPhotos={1}
                />
              </div>

              {/* DNI Back Photo */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Foto Trasera del DNI
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sube una foto clara del lado trasero del DNI donde se vean los códigos y información adicional.
                </p>
                <PhotoUpload
                  photos={idPhotos.back ? [idPhotos.back] : []}
                  onPhotosChange={(photos) => {
                    setIdPhotos(prev => ({ ...prev, back: photos[0] || null }))
                  }}
                  maxPhotos={1}
                />
              </div>

              {/* Instructions */}
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Recomendaciones para las fotos:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Asegúrate de que toda la información sea legible</li>
                    <li>• Evita reflejos o sombras sobre el documento</li>
                    <li>• El DNI debe estar completo en la foto</li>
                    <li>• La imagen no debe estar borrosa o pixelada</li>
                    <li>• Preferiblemente usa buena iluminación</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Volver
                </Button>
                <Button
                  onClick={handleIdPhotosComplete}
                  disabled={!idPhotos.front || !idPhotos.back}
                >
                  Continuar al Contrato
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Contrato</h1>
            <p className="text-muted-foreground">
              {selectedTemplate 
                ? `Usando plantilla: ${selectedTemplate.title}`
                : 'Busca un préstamo y genera el contrato correspondiente'
              }
            </p>
          </div>
          <div className="flex gap-2">
            {idPhotos.front && idPhotos.back && (
              <Badge variant="default" className="px-3 py-1">
                <Check className="h-3 w-3 mr-1" />
                DNI Verificado
              </Badge>
            )}
            {selectedTemplate && (
              <Badge variant="secondary" className="px-3 py-1">
                <FileText className="h-3 w-3 mr-1" />
                {selectedTemplate.title}
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Contrato</CardTitle>
            <CardDescription>
              Completa los datos del contrato. Los campos marcados con (*) son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractForm
              onSubmit={handleCreateContract}
              isLoading={isSubmitting}
              initialData={{
                content: selectedTemplate ? (selectedTemplate.richContent || selectedTemplate.content) : undefined
              }}
            />
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Volver a Verificación DNI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
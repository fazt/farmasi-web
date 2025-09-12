'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, User, Phone, FileText, Mail } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
} from '@/components/ui/form'

// Schema for required client fields only
const quickClientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  documentType: z.string().min(1, 'Debe seleccionar un tipo de documento'),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

type QuickClientData = z.infer<typeof quickClientSchema>

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  documentType: string
  documentNumber: string
}

interface QuickClientModalProps {
  onClientCreated: (client: Client) => void
}

export function QuickClientModal({ onClientCreated }: QuickClientModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<QuickClientData>({
    resolver: zodResolver(quickClientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      email: '',
    },
  })

  const handleSubmit = async (data: QuickClientData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newClient = await response.json()
        onClientCreated(newClient)
        form.reset()
        setOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear el cliente')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Error de conexión. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nombre *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Apellido *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Tipo Doc. *</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => {
                  const documentType = form.watch('documentType')
                  const documentValue = field.value || ''
                  
                  const getValidation = () => {
                    if (!documentType || !documentValue) return { showError: false, message: '', placeholder: 'Número' }
                    
                    switch (documentType) {
                      case 'DNI':
                        return {
                          showError: documentValue.length > 0 && documentValue.length < 8,
                          message: `${documentValue.length}/8`,
                          placeholder: '12345678',
                          maxLength: 8,
                          isNumeric: true
                        }
                      case 'CE':
                        return {
                          showError: documentValue.length > 0 && documentValue.length < 9,
                          message: `${documentValue.length}/9`,
                          placeholder: '123456789',
                          maxLength: 9,
                          isNumeric: true
                        }
                      case 'PASAPORTE':
                        return {
                          showError: documentValue.length > 0 && documentValue.length < 6,
                          message: `${documentValue.length}/6+`,
                          placeholder: 'ABC123',
                          maxLength: 12,
                          isNumeric: false
                        }
                      default:
                        return { showError: false, message: '', placeholder: 'Número' }
                    }
                  }
                  
                  const validation = getValidation()
                  
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Número *</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={validation.placeholder}
                          className={validation.showError ? 'border-red-500' : ''}
                          onInput={(e) => {
                            let value = e.currentTarget.value
                            if (validation.isNumeric) {
                              value = value.replace(/[^0-9]/g, '')
                            }
                            field.onChange(value)
                          }}
                          value={documentValue}
                        />
                      </FormControl>
                      {validation.showError && validation.message && (
                        <div className="text-xs text-red-600">
                          {validation.message}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Teléfono</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="987654321"
                      onInput={(e) => {
                        const value = e.currentTarget.value.replace(/[^0-9]/g, '')
                        field.onChange(value)
                      }}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="correo@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#FF5B67] hover:bg-[#FF4755] text-white"
              >
                {isLoading ? 'Creando...' : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Phone, FileText, Mail, MapPin, Briefcase, Calendar, Users, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { clientSchema, type ClientFormData } from '@/lib/validations/client'

interface ClientFormProps {
  initialData?: Partial<ClientFormData>
  onSubmit: (data: ClientFormData) => Promise<void>
  isLoading?: boolean
  formId?: string
  section?: 'personal' | 'documents' | 'all'
}

export function ClientForm({ initialData, onSubmit, isLoading, formId, section = 'all' }: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      documentType: initialData?.documentType || '',
      documentNumber: initialData?.documentNumber || '',
      birthDate: initialData?.birthDate || null,
      gender: initialData?.gender || undefined,
      maritalStatus: initialData?.maritalStatus || undefined,
      occupation: initialData?.occupation || '',
    },
  })

  const handleSubmit = async (data: ClientFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Género</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione el género" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="MALE">Masculino</SelectItem>
                <SelectItem value="FEMALE">Femenino</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maritalStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Estado Civil</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione el estado civil" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="SINGLE">Soltero/a</SelectItem>
                <SelectItem value="MARRIED">Casado/a</SelectItem>
                <SelectItem value="DIVORCED">Divorciado/a</SelectItem>
                <SelectItem value="WIDOWED">Viudo/a</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="occupation"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Ocupación</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Ingrese la ocupación" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  const renderDocumentsInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => {
            const phoneValue = field.value || ''
            const showError = phoneValue.length > 0 && phoneValue.length < 9
            
            return (
              <FormItem>
                <FormLabel className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="987654321"
                    className={showError ? 'border-red-500 focus:border-red-500' : ''}
                    onInput={(e) => {
                      const value = e.currentTarget.value.replace(/[^0-9]/g, '')
                      field.onChange(value)
                    }}
                    value={phoneValue}
                  />
                </FormControl>
                {showError && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600">
                      Faltan {9 - phoneValue.length} dígitos ({phoneValue.length}/9)
                    </span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )
          }}
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

        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Tipo de Documento *</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CE">Carné de Extranjería</SelectItem>
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
              if (!documentType || !documentValue) return { showError: false, message: '', placeholder: 'Ingrese el número' }
              
              switch (documentType) {
                case 'DNI':
                  const dniValid = documentValue.length === 8
                  return {
                    showError: documentValue.length > 0 && documentValue.length < 8,
                    message: `Faltan ${8 - documentValue.length} dígitos (${documentValue.length}/8)`,
                    placeholder: '12345678',
                    maxLength: 8,
                    isNumeric: true
                  }
                case 'CE':
                  const ceValid = documentValue.length === 9
                  return {
                    showError: documentValue.length > 0 && documentValue.length < 9,
                    message: `Faltan ${9 - documentValue.length} dígitos (${documentValue.length}/9)`,
                    placeholder: '123456789',
                    maxLength: 9,
                    isNumeric: true
                  }
                case 'PASAPORTE':
                  const passportValid = documentValue.length >= 6 && documentValue.length <= 12
                  return {
                    showError: documentValue.length > 0 && documentValue.length < 6,
                    message: documentValue.length < 6 ? `Mínimo 6 caracteres (${documentValue.length}/6)` : '',
                    placeholder: 'ABC123456',
                    maxLength: 12,
                    isNumeric: false
                  }
                default:
                  return { showError: false, message: '', placeholder: 'Ingrese el número' }
              }
            }
            
            const validation = getValidation()
            
            return (
              <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Número de Documento *</span>
                  </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={validation.placeholder}
                    className={validation.showError ? 'border-red-500 focus:border-red-500' : ''}
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
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600">
                      {validation.message}
                    </span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Ciudad</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ingrese la ciudad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Estado/Departamento</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el estado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Dirección</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ingrese la dirección completa"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  return (
    <Form {...form}>
      <form 
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6"
      >
        {(section === 'all' || section === 'personal') && renderPersonalInfo()}
        {(section === 'all' || section === 'documents') && renderDocumentsInfo()}
      </form>
    </Form>
  )
}
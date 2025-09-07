'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const userFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingrese un email válido'),
  role: z.enum(['ADMIN', 'USER']),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<UserFormData>
  isEditMode?: boolean
}

export function UserForm({ onSubmit, isLoading, defaultValues, isEditMode }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<UserFormData>({
    resolver: zodResolver(
      isEditMode 
        ? userFormSchema.extend({
            password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional().or(z.literal('')),
          })
        : userFormSchema
    ),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      role: defaultValues?.role || 'USER',
      password: '',
    },
  })

  const handleSubmit = async (data: UserFormData) => {
    // Remove password if it's empty in edit mode
    if (isEditMode && !data.password) {
      const { password, ...dataWithoutPassword } = data
      await onSubmit(dataWithoutPassword as UserFormData)
    } else {
      await onSubmit(data)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del usuario" {...field} />
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
                <FormLabel>Correo electrónico *</FormLabel>
                <FormControl>
                  <Input placeholder="usuario@ejemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Los administradores tienen acceso completo al sistema
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isEditMode ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={isEditMode ? "Dejar vacío para no cambiar" : "Contraseña"}
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                {isEditMode && (
                  <FormDescription>
                    Dejar vacío para mantener la contraseña actual
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              isEditMode ? 'Actualizando...' : 'Creando...'
            ) : (
              isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
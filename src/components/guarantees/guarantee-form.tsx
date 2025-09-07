'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { guaranteeSchema, type GuaranteeFormData } from '@/lib/validations/guarantee'

interface GuaranteeFormProps {
  initialData?: Partial<GuaranteeFormData>
  onSubmit: (data: GuaranteeFormData) => Promise<void>
  isLoading?: boolean
}

export function GuaranteeForm({ initialData, onSubmit, isLoading }: GuaranteeFormProps) {
  const form = useForm<GuaranteeFormData>({
    resolver: zodResolver(guaranteeSchema),
    defaultValues: {
      name: initialData?.name || '',
      value: initialData?.value || 0,
      photo: initialData?.photo || '',
      description: initialData?.description || '',
      status: initialData?.status || 'ACTIVE',
    },
  })

  const handleSubmit = async (data: GuaranteeFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Garantía *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Vehículo Toyota Yaris 2018" {...field} />
                </FormControl>
                <FormDescription>
                  Ingrese el nombre descriptivo de la garantía
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Aproximado (S/.) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15000.00"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Valor estimado de la garantía en soles
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activa</SelectItem>
                    <SelectItem value="INACTIVE">Inactiva</SelectItem>
                    <SelectItem value="USED">En Uso</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Estado actual de la garantía en el sistema
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de la Foto</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL de la imagen de la garantía (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción detallada de la garantía, estado, características especiales, etc."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Información adicional sobre la garantía (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Garantía'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
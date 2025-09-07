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
  formId?: string
}

export function GuaranteeForm({ initialData, onSubmit, isLoading, formId }: GuaranteeFormProps) {
  const form = useForm<GuaranteeFormData>({
    resolver: zodResolver(guaranteeSchema),
    defaultValues: {
      name: initialData?.name || '',
      value: initialData?.value || 0,
      photos: [],
    },
  })

  const handleSubmit = async (data: GuaranteeFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
      
      // Mostrar error específico si existe
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('Error al guardar la garantía. Revise los datos e intente nuevamente.')
      }
    }
  }


  return (
    <Form {...form}>
      <form 
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6"
      >
        <div className="space-y-4">
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
                    value={field.value?.toString() || ''}
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
        </div>
      </form>
    </Form>
  )
}
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { guaranteeSchema, type GuaranteeFormData } from '@/lib/validations/guarantee'

interface QuickGuaranteeModalProps {
  onGuaranteeCreated: (guarantee: any) => void
}

export function QuickGuaranteeModal({ onGuaranteeCreated }: QuickGuaranteeModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GuaranteeFormData>({
    resolver: zodResolver(guaranteeSchema),
    defaultValues: {
      name: '',
      value: '' as any,
      photos: [],
    },
  })

  const handleSubmit = async (data: GuaranteeFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/guarantees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          value: data.value,
        }),
      })

      if (response.ok) {
        const newGuarantee = await response.json()
        onGuaranteeCreated(newGuarantee)
        form.reset()
        setOpen(false)
      } else {
        const error = await response.json()
        console.error('Error creating guarantee:', error)
        alert(error.error || 'Error al crear la garantía')
      }
    } catch (error) {
      console.error('Error creating guarantee:', error)
      alert('Error al crear la garantía')
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Plus className="h-4 w-4 mr-1" />
          Nueva
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Garantía</DialogTitle>
          <DialogDescription>
            Registre rápidamente una nueva garantía para usar en este préstamo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Garantía *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Toyota Corolla 2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Estimado (S/) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Garantía'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
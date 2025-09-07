'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { interestRateSchema, type InterestRateFormData } from '@/lib/validations/interest-rate'

interface InterestRateFormProps {
  initialData?: Partial<InterestRateFormData>
  onSubmit: (data: InterestRateFormData) => Promise<void>
  isLoading?: boolean
}

export function InterestRateForm({ initialData, onSubmit, isLoading }: InterestRateFormProps) {
  const form = useForm<InterestRateFormData>({
    resolver: zodResolver(interestRateSchema),
    defaultValues: {
      loanAmount: initialData?.loanAmount || '' as any,
      weeklyPayment: initialData?.weeklyPayment || '' as any,
      weeksCount: initialData?.weeksCount || 6,
      isActive: initialData?.isActive ?? true,
    },
  })

  const loanAmount = form.watch('loanAmount')
  const weeklyPayment = form.watch('weeklyPayment')
  const weeksCount = form.watch('weeksCount')


  const handleSubmit = async (data: InterestRateFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const loanAmountNum = Number(loanAmount) || 0
  const weeklyPaymentNum = Number(weeklyPayment) || 0
  const weeksCountNum = Number(weeksCount) || 6

  const totalPayment = loanAmountNum > 0 && weeklyPaymentNum > 0 ? weeklyPaymentNum * weeksCountNum : 0
  const interestAmount = totalPayment - loanAmountNum
  const interestRate = loanAmountNum > 0 ? (interestAmount / loanAmountNum) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Intereses</CardTitle>
          <CardDescription>
            Ingresa el monto del préstamo o el pago semanal para calcular automáticamente el otro valor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto del Préstamo (S/.)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="500.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weeklyPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pago Semanal (S/.)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="105.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weeksCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Semanas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="52"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Por defecto son 6 semanas según el sistema de préstamos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Tasa Activa</FormLabel>
                        <FormDescription>
                          Solo las tasas activas pueden ser utilizadas en nuevos préstamos
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {loanAmountNum > 0 && weeklyPaymentNum > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen del Préstamo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monto del préstamo:</span>
                      <span className="font-medium">S/. {loanAmountNum.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pago semanal:</span>
                      <span className="font-medium">S/. {weeklyPaymentNum.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Número de semanas:</span>
                      <span className="font-medium">{weeksCountNum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total a pagar:</span>
                      <span className="font-medium">S/. {totalPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Intereses:</span>
                      <span className="font-medium">S/. {interestAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Tasa de interés:</span>
                      <span className="font-bold text-primary">{interestRate.toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Tasa de Interés'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
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
  const [calculatedPayment, setCalculatedPayment] = useState<number | null>(null)
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null)

  const form = useForm<InterestRateFormData>({
    resolver: zodResolver(interestRateSchema),
    defaultValues: {
      loanAmount: initialData?.loanAmount || 0,
      weeklyPayment: initialData?.weeklyPayment || 0,
      weeksCount: initialData?.weeksCount || 6,
      isActive: initialData?.isActive ?? true,
    },
  })

  const loanAmount = form.watch('loanAmount')
  const weeklyPayment = form.watch('weeklyPayment')
  const weeksCount = form.watch('weeksCount')

  // Calculate weekly payment when loan amount changes
  useEffect(() => {
    if (loanAmount && weeksCount && loanAmount !== calculatedAmount) {
      // Based on the examples in README: calculate interest and payment
      const totalPayment = calculateTotalPayment(loanAmount)
      const weekly = totalPayment / weeksCount
      setCalculatedPayment(Math.round(weekly * 100) / 100)
      setCalculatedAmount(loanAmount)
    }
  }, [loanAmount, weeksCount, calculatedAmount])

  // Calculate loan amount when weekly payment changes
  const calculateLoanAmountFromPayment = (payment: number): number => {
    // Reverse calculation based on the interest rates
    const totalPayment = payment * weeksCount
    
    // Try to find the closest loan amount based on known rates
    const knownRates = [
      { amount: 500, payment: 105 },
      { amount: 600, payment: 110 },
      { amount: 700, payment: 145 },
      { amount: 800, payment: 165 },
      { amount: 1000, payment: 210 },
      { amount: 1500, payment: 320 },
    ]
    
    // Find the rate that matches the payment or interpolate
    for (const rate of knownRates) {
      if (Math.abs(rate.payment - payment) < 5) {
        return rate.amount
      }
    }
    
    // If no exact match, do a rough calculation
    // Average interest rate is around 20-25% for 6 weeks
    return Math.round((totalPayment / 1.25) * 100) / 100
  }

  const calculateTotalPayment = (amount: number): number => {
    // Based on the examples in README, calculate total payment
    const knownRates = [
      { amount: 500, payment: 105 },
      { amount: 600, payment: 110 },
      { amount: 700, payment: 145 },
      { amount: 800, payment: 165 },
      { amount: 1000, payment: 210 },
      { amount: 1500, payment: 320 },
    ]
    
    // Find exact match
    const exactMatch = knownRates.find(rate => rate.amount === amount)
    if (exactMatch) {
      return exactMatch.payment * 6
    }
    
    // Interpolate or calculate based on pattern
    if (amount <= 600) {
      return amount * 1.26 // ~26% for lower amounts
    } else if (amount <= 1000) {
      return amount * 1.24 // ~24% for medium amounts
    } else {
      return amount * 1.28 // ~28% for higher amounts
    }
  }

  const handleLoanAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    form.setValue('loanAmount', numValue)
    
    if (numValue > 0) {
      const totalPayment = calculateTotalPayment(numValue)
      const weekly = totalPayment / weeksCount
      form.setValue('weeklyPayment', Math.round(weekly * 100) / 100)
    }
  }

  const handleWeeklyPaymentChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    form.setValue('weeklyPayment', numValue)
    
    if (numValue > 0) {
      const estimatedAmount = calculateLoanAmountFromPayment(numValue)
      form.setValue('loanAmount', estimatedAmount)
    }
  }

  const handleSubmit = async (data: InterestRateFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const totalPayment = loanAmount * weeksCount ? weeklyPayment * weeksCount : 0
  const interestAmount = totalPayment - loanAmount
  const interestRate = loanAmount > 0 ? (interestAmount / loanAmount) * 100 : 0

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
                          value={field.value || ''}
                          onChange={(e) => handleLoanAmountChange(e.target.value)}
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
                          value={field.value || ''}
                          onChange={(e) => handleWeeklyPaymentChange(e.target.value)}
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
                          value={field.value || 6}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 6)}
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

              {loanAmount > 0 && weeklyPayment > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen del Préstamo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monto del préstamo:</span>
                      <span className="font-medium">S/. {loanAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pago semanal:</span>
                      <span className="font-medium">S/. {weeklyPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Número de semanas:</span>
                      <span className="font-medium">{weeksCount}</span>
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
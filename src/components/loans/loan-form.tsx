'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

interface InterestRate {
  id: string
  loanAmount: number
  weeklyPayment: number
  weeksCount: number
  isActive: boolean
}

interface Guarantee {
  id: string
  name: string
  value: number
  status: string
}

interface LoanFormProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function LoanForm({ onSubmit, isLoading }: LoanFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [interestRates, setInterestRates] = useState<InterestRate[]>([])
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [selectedRate, setSelectedRate] = useState<InterestRate | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm({
    defaultValues: {
      clientId: '',
      interestRateId: '',
      guaranteeId: '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, ratesRes, guaranteesRes] = await Promise.all([
          fetch('/api/clients?limit=100'),
          fetch('/api/interest-rates?active=true&limit=100'),
          fetch('/api/guarantees?status=ACTIVE&limit=100'),
        ])

        const [clientsData, ratesData, guaranteesData] = await Promise.all([
          clientsRes.json(),
          ratesRes.json(),
          guaranteesRes.json(),
        ])

        setClients(clientsData.clients || [])
        setInterestRates(ratesData.interestRates || [])
        setGuarantees(guaranteesData.guarantees || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const handleInterestRateChange = (rateId: string) => {
    const rate = interestRates.find(r => r.id === rateId)
    setSelectedRate(rate || null)
    form.setValue('interestRateId', rateId)
  }

  const handleSubmit = async (data: any) => {
    if (!selectedRate) {
      alert('Debe seleccionar una tasa de interés')
      return
    }

    const loanData = {
      clientId: data.clientId,
      interestRateId: data.interestRateId,
      guaranteeId: data.guaranteeId,
    }

    try {
      await onSubmit(loanData)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const calculateDueDate = (weeks: number) => {
    const dueDate = addWeeks(new Date(), weeks)
    return format(dueDate, 'dd/MM/yyyy', { locale: es })
  }

  if (loadingData) {
    return <div className="text-center py-8">Cargando datos...</div>
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex flex-col">
                            <span>{`${client.firstName} ${client.lastName}`}</span>
                            {(client.email || client.phone) && (
                              <span className="text-xs text-muted-foreground">
                                {client.email || client.phone}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione el cliente que recibirá el préstamo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestRateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa de Interés *</FormLabel>
                  <Select onValueChange={handleInterestRateChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una tasa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {interestRates.map((rate) => (
                        <SelectItem key={rate.id} value={rate.id}>
                          <div className="flex flex-col">
                            <span>{formatCurrency(rate.loanAmount)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(rate.weeklyPayment)}/semana × {rate.weeksCount} semanas
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione el monto y términos del préstamo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guaranteeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garantía *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una garantía" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guarantees.map((guarantee) => (
                        <SelectItem key={guarantee.id} value={guarantee.id}>
                          <div className="flex flex-col">
                            <span>{guarantee.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Valor: {formatCurrency(guarantee.value)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione la garantía que respaldará el préstamo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {selectedRate && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Préstamo</CardTitle>
                <CardDescription>
                  Detalles del préstamo basado en la tasa de interés seleccionada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-medium">Monto del Préstamo</div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(selectedRate.loanAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Pago Semanal</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(selectedRate.weeklyPayment)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Número de Semanas</div>
                    <div className="text-lg font-bold">
                      {selectedRate.weeksCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Total a Pagar</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(selectedRate.weeklyPayment * selectedRate.weeksCount)}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Fecha de Vencimiento:</span>
                    <span className="font-bold text-orange-600">
                      {calculateDueDate(selectedRate.weeksCount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Intereses:</span>
                    <span className="font-bold">
                      {formatCurrency(
                        (selectedRate.weeklyPayment * selectedRate.weeksCount) - selectedRate.loanAmount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Tasa de Interés:</span>
                    <span className="font-bold text-red-600">
                      {(((selectedRate.weeklyPayment * selectedRate.weeksCount) - selectedRate.loanAmount) / selectedRate.loanAmount * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isLoading || !selectedRate}>
              {isLoading ? 'Creando Préstamo...' : 'Crear Préstamo'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Percent, Shield } from 'lucide-react'
import { z } from 'zod'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ClientSearchModal } from '@/components/loans/client-search-modal'
import { QuickGuaranteeModal } from '@/components/guarantees/quick-guarantee-modal'

// Form validation schema
const loanFormSchema = z.object({
  clientId: z.string().min(1, 'Debe seleccionar un cliente'),
  interestRateId: z.string().min(1, 'Debe seleccionar una tasa de interés'),
  guaranteeId: z.string().min(1, 'Debe seleccionar una garantía'),
  guarantorId: z.string().optional(),
})

type LoanFormData = z.infer<typeof loanFormSchema>

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  documentType: string
  documentNumber: string
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
}

interface LoanFormProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  renderSkeleton?: boolean
  onDataLoaded?: () => void
}

export function LoanForm({ onSubmit, isLoading, renderSkeleton, onDataLoaded }: LoanFormProps) {
  const [interestRates, setInterestRates] = useState<InterestRate[]>([])
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedRate, setSelectedRate] = useState<InterestRate | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedGuarantor, setSelectedGuarantor] = useState<Client | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      clientId: '',
      interestRateId: '',
      guaranteeId: '',
      guarantorId: '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratesRes, guaranteesRes, clientsRes] = await Promise.all([
          fetch('/api/interest-rates?active=true&limit=100'),
          fetch('/api/guarantees?limit=100'),
          fetch('/api/clients?limit=100'),
        ])

        const [ratesData, guaranteesData, clientsData] = await Promise.all([
          ratesRes.json(),
          guaranteesRes.json(),
          clientsRes.json(),
        ])

        setInterestRates(ratesData.interestRates || [])
        setGuarantees(guaranteesData.guarantees || [])
        setClients(clientsData.clients || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingData(false)
        if (onDataLoaded) {
          onDataLoaded()
        }
      }
    }

    fetchData()
  }, [onDataLoaded])

  const handleInterestRateChange = (rateId: string) => {
    const rate = interestRates.find(r => r.id === rateId)
    setSelectedRate(rate || null)
    form.setValue('interestRateId', rateId)
  }


  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    form.setValue('clientId', client.id)
  }

  const handleGuaranteeCreated = (newGuarantee: Guarantee) => {
    setGuarantees(prev => [newGuarantee, ...prev])
    form.setValue('guaranteeId', newGuarantee.id)
  }

  const handleGuarantorSelect = (guarantor: Client) => {
    setSelectedGuarantor(guarantor)
    form.setValue('guarantorId', guarantor.id)
  }

  const handleGuarantorClear = () => {
    setSelectedGuarantor(null)
    form.setValue('guarantorId', '')
  }

  const handleSubmit = async (data: LoanFormData) => {
    if (!selectedRate) {
      alert('Debe seleccionar una tasa de interés')
      return
    }

    if (!selectedClient) {
      alert('Debe seleccionar un cliente')
      return
    }

    const loanData = {
      clientId: selectedClient.id,
      interestRateId: data.interestRateId,
      guaranteeId: data.guaranteeId,
      ...(data.guarantorId && { guarantorId: data.guarantorId }),
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

  const LoanFormSkeleton = () => (
    <div className="space-y-6">
      {/* Cliente field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      {/* Tasa de Interés field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Garantía field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-4 w-56" />
      </div>
      
      {/* Button skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )

  if (loadingData || renderSkeleton) {
    return <LoanFormSkeleton />
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <FormLabel className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Cliente *</span>
              </FormLabel>
              <ClientSearchModal 
                selectedClient={selectedClient}
                onClientSelect={handleClientSelect}
                disabled={isLoading}
              />
              <FormDescription>
                Seleccione el cliente que recibirá el préstamo
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="interestRateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Percent className="h-4 w-4" />
                    <span>Tasa de Interés *</span>
                  </FormLabel>
                  <Select onValueChange={handleInterestRateChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
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
                  <FormLabel className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Garantía *</span>
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccione una garantía" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guarantees.length > 0 ? (
                          guarantees.map((guarantee) => (
                            <SelectItem key={guarantee.id} value={guarantee.id}>
                              <div className="flex flex-col">
                                <span>{guarantee.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Valor: {formatCurrency(guarantee.value)}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            No hay garantías disponibles. <br />
                            Debe registrar al menos una garantía antes de crear un préstamo.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <QuickGuaranteeModal onGuaranteeCreated={handleGuaranteeCreated} />
                  </div>
                  <FormDescription>
                    Seleccione una garantía existente o cree una nueva para respaldar el préstamo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Garante (Opcional)</span>
              </FormLabel>
              <ClientSearchModal 
                selectedClient={selectedGuarantor}
                onClientSelect={handleGuarantorSelect}
                excludeClientId={selectedClient?.id}
                disabled={isLoading}
                placeholder="Buscar garante..."
                triggerText={selectedGuarantor ? 
                  `${selectedGuarantor.firstName} ${selectedGuarantor.lastName}` : 
                  "Seleccionar Garante"
                }
              />
              <FormDescription>
                Cliente que recomienda y respalda este préstamo (opcional)
              </FormDescription>
            </div>
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
            <Button 
              type="submit" 
              disabled={isLoading || !selectedRate || !selectedClient}
              className="bg-[#FF5B67] hover:bg-[#FF4755] text-white"
            >
              {isLoading ? 'Creando Préstamo...' : 'Crear Préstamo'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
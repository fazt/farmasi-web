'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Calculator } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { paymentSchema, type PaymentFormData } from '@/lib/validations/payment'

interface Loan {
  id: string
  amount: number
  weeklyPayment: number
  totalAmount: number
  paidAmount: number
  balance: number
  status: string
  loanDate: Date
  dueDate: Date
  client: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
  }
  interestRate: {
    loanAmount: number
    weeklyPayment: number
    weeksCount: number
  }
  guarantee: {
    id: string
    name: string
    value: number
  }
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>
  isLoading?: boolean
}

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Loan[]>([])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      loanId: '',
      amount: '' as any,
      paymentDate: new Date(),
    },
  })

  const searchLoans = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/loans/search?search=${encodeURIComponent(term)}&activeOnly=true`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data.loans || [])
      } else {
        console.error('Error searching loans:', data.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching loans:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLoans(searchTerm)
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleLoanSelect = (loanId: string) => {
    const loan = searchResults.find(l => l.id === loanId)
    setSelectedLoan(loan || null)
    form.setValue('loanId', loanId)
    
    // Set suggested payment amount (weekly payment or remaining balance, whichever is less)
    if (loan) {
      const suggestedAmount = Math.min(loan.weeklyPayment, loan.balance)
      form.setValue('amount', suggestedAmount.toString() as any)
    }
  }

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      await onSubmit(data)
      // Reset form
      form.reset()
      setSelectedLoan(null)
      setSearchTerm('')
      setSearchResults([])
    } catch (error) {
      console.error('Error submitting payment:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const isOverdue = (loan: Loan) => {
    return new Date() > new Date(loan.dueDate)
  }

  const calculateProgress = (paidAmount: number, totalAmount: number) => {
    return (paidAmount / totalAmount) * 100
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Préstamo
          </CardTitle>
          <CardDescription>
            Busca el préstamo por nombre del cliente, email, teléfono o documento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Buscar cliente (nombre, email, teléfono, documento)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchLoading && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Préstamos encontrados:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((loan) => (
                    <Card 
                      key={loan.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedLoan?.id === loan.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleLoanSelect(loan.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {`${loan.client.firstName} ${loan.client.lastName}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {loan.client.email || loan.client.phone || 'Sin contacto'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Préstamo: {formatCurrency(loan.amount)} | 
                              Saldo: {formatCurrency(loan.balance)}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={isOverdue(loan) ? 'destructive' : 'default'}>
                              {isOverdue(loan) ? 'Vencido' : 'Activo'}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              Vence: {format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: es })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchTerm && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-4 text-muted-foreground">
                No se encontraron préstamos activos
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedLoan && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Detalles del Préstamo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="font-medium">Cliente</div>
                <div>{`${selectedLoan.client.firstName} ${selectedLoan.client.lastName}`}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedLoan.client.email || selectedLoan.client.phone || 'Sin contacto'}
                </div>
              </div>
              <div>
                <div className="font-medium">Garantía</div>
                <div className="truncate">{selectedLoan.guarantee.name}</div>
                <div className="text-sm text-muted-foreground">
                  Valor: {formatCurrency(selectedLoan.guarantee.value)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="font-medium text-lg">{formatCurrency(selectedLoan.amount)}</div>
                <div className="text-sm text-muted-foreground">Monto Original</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg text-green-600">{formatCurrency(selectedLoan.paidAmount)}</div>
                <div className="text-sm text-muted-foreground">Pagado</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg text-red-600">{formatCurrency(selectedLoan.balance)}</div>
                <div className="text-sm text-muted-foreground">Saldo Pendiente</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg">{formatCurrency(selectedLoan.weeklyPayment)}</div>
                <div className="text-sm text-muted-foreground">Cuota Semanal</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del Préstamo</span>
                <span>{calculateProgress(selectedLoan.paidAmount, selectedLoan.totalAmount).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    calculateProgress(selectedLoan.paidAmount, selectedLoan.totalAmount) >= 100 ? 'bg-green-500' : 
                    calculateProgress(selectedLoan.paidAmount, selectedLoan.totalAmount) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(calculateProgress(selectedLoan.paidAmount, selectedLoan.totalAmount), 100)}%` }}
                />
              </div>
            </div>

            {isOverdue(selectedLoan) && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Este préstamo está vencido desde el {format(new Date(selectedLoan.dueDate), 'dd/MM/yyyy', { locale: es })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedLoan && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Pago</CardTitle>
            <CardDescription>
              Ingresa el monto del pago que se está recibiendo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto del Pago (S/.) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={selectedLoan.balance}
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Monto máximo: {formatCurrency(selectedLoan.balance)} (saldo pendiente)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.setValue('amount', selectedLoan.weeklyPayment.toString() as any)}
                    disabled={selectedLoan.weeklyPayment > selectedLoan.balance}
                  >
                    Cuota Semanal ({formatCurrency(selectedLoan.weeklyPayment)})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.setValue('amount', selectedLoan.balance.toString() as any)}
                  >
                    Pago Total ({formatCurrency(selectedLoan.balance)})
                  </Button>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registrando Pago...' : 'Registrar Pago'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
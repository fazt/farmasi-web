'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, FileText, Search } from 'lucide-react'
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
import { WYSIWYGEditor } from '@/components/ui/wysiwyg-editor'
import { contractSchema, type ContractFormData } from '@/lib/validations/contract'

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

interface ContractFormProps {
  initialData?: Partial<ContractFormData>
  onSubmit: (data: ContractFormData) => Promise<void>
  isLoading?: boolean
}

export function ContractForm({ initialData, onSubmit, isLoading }: ContractFormProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Loan[]>([])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      clientId: initialData?.clientId || '',
      loanId: initialData?.loanId || '',
      guaranteeId: initialData?.guaranteeId || '',
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || addWeeks(new Date(), 6),
      amount: initialData?.amount || 0,
      interest: initialData?.interest || 0,
      installments: initialData?.installments || 6,
      status: initialData?.status || 'ACTIVE',
      signature: initialData?.signature || '',
      content: initialData?.content || `<h2>CONTRATO DE PRÉSTAMO</h2>

<p>En la ciudad de [CIUDAD], a los [DÍA] días del mes de [MES] de [AÑO], se celebra el presente CONTRATO DE PRÉSTAMO entre:</p>

<p><strong>EL PRESTAMISTA:</strong><br>
[NOMBRE DE LA EMPRESA]<br>
RUC: [RUC]<br>
Domicilio: [DIRECCIÓN]</p>

<p><strong>EL PRESTATARIO:</strong><br>
Nombres y Apellidos: [NOMBRE_CLIENTE]<br>
DNI: [DNI_CLIENTE]<br>
Domicilio: [DIRECCIÓN_CLIENTE]<br>
Teléfono: [TELÉFONO_CLIENTE]</p>

<h3>PRIMERA: OBJETO DEL CONTRATO</h3>
<p>El PRESTAMISTA otorga al PRESTATARIO un préstamo por la suma de [MONTO_PRÉSTAMO] soles ([MONTO_LETRAS]).</p>

<h3>SEGUNDA: PLAZO Y FORMA DE PAGO</h3>
<p>El préstamo será devuelto en [NÚMERO_CUOTAS] cuotas semanales de [MONTO_CUOTA] soles cada una, iniciando el [FECHA_INICIO] y finalizando el [FECHA_FIN].</p>

<h3>TERCERA: INTERESES</h3>
<p>El préstamo generará intereses por la suma total de [MONTO_INTERESES] soles.</p>

<h3>CUARTA: GARANTÍA</h3>
<p>Como garantía del cumplimiento de las obligaciones contraídas, el PRESTATARIO entrega en garantía: [DESCRIPCIÓN_GARANTÍA] valorizada en [VALOR_GARANTÍA] soles.</p>

<h3>QUINTA: INCUMPLIMIENTO</h3>
<p>En caso de incumplimiento de pago, el PRESTAMISTA podrá ejecutar la garantía y exigir el pago total de la deuda.</p>

<p><br><br>
_____________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_____________________<br>
PRESTAMISTA&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PRESTATARIO</p>`,
    },
  })

  const searchLoans = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/loans/search?search=${encodeURIComponent(term)}`)
      const data = await response.json()
      
      if (response.ok) {
        // Filter loans that don't have contracts yet
        const loansWithoutContracts = data.loans.filter((loan: Loan) => {
          // TODO: Add a field to check if loan has contract
          return true // For now, show all loans
        })
        setSearchResults(loansWithoutContracts)
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
    if (!loan) return

    setSelectedLoan(loan)
    
    // Auto-fill form with loan data - ensure amounts are numbers
    form.setValue('loanId', loanId)
    form.setValue('clientId', loan.client.id)
    form.setValue('guaranteeId', loan.guarantee.id)
    form.setValue('amount', Number(loan.amount))
    form.setValue('interest', Number(loan.totalAmount) - Number(loan.amount))
    form.setValue('installments', loan.interestRate.weeksCount)
    form.setValue('startDate', new Date(loan.loanDate))
    form.setValue('endDate', new Date(loan.dueDate))
  }

  const handleSubmit = async (data: ContractFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting contract:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es })
  }

  return (
    <div className="space-y-6">
      {/* Search for Loan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Préstamo para Contrato
          </CardTitle>
          <CardDescription>
            Busca el préstamo por nombre del cliente para generar el contrato
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
                              Total: {formatCurrency(loan.totalAmount)}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {loan.status === 'ACTIVE' ? 'Activo' : loan.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              Vence: {formatDate(loan.dueDate)}
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
                No se encontraron préstamos
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Form */}
      {selectedLoan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Datos del Contrato
            </CardTitle>
            <CardDescription>
              Información del contrato basada en el préstamo seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Client and Loan Info Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Cliente</div>
                    <div>{`${selectedLoan.client.firstName} ${selectedLoan.client.lastName}`}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedLoan.client.email || selectedLoan.client.phone || 'Sin contacto'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Préstamo</div>
                    <div>{formatCurrency(selectedLoan.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedLoan.interestRate.weeksCount} semanas
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Garantía</div>
                    <div className="truncate">{selectedLoan.guarantee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(selectedLoan.guarantee.value)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto del Contrato (S/.)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            readOnly
                            {...field}
                            value={field.value?.toString() || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Monto principal del préstamo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intereses (S/.)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            readOnly
                            {...field}
                            value={field.value?.toString() || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Total de intereses del préstamo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Cuotas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            readOnly
                            {...field}
                            value={field.value || 6}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 6)}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de cuotas semanales
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
                        <FormLabel>Estado del Contrato</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione el estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Activo</SelectItem>
                            <SelectItem value="COMPLETED">Completado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Estado actual del contrato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contract Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido del Contrato</FormLabel>
                      <FormControl>
                        <WYSIWYGEditor
                          content={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Escriba el contenido del contrato aquí..."
                          className="min-h-[400px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Use variables como [NOMBRE_CLIENTE], [MONTO_PRÉSTAMO], etc. para datos dinámicos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Summary */}
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen del Contrato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="font-medium text-lg">{formatCurrency(selectedLoan.amount)}</div>
                        <div className="text-sm text-muted-foreground">Monto Principal</div>
                      </div>
                      <div>
                        <div className="font-medium text-lg">{formatCurrency(selectedLoan.totalAmount - selectedLoan.amount)}</div>
                        <div className="text-sm text-muted-foreground">Intereses</div>
                      </div>
                      <div>
                        <div className="font-medium text-lg">{formatCurrency(selectedLoan.totalAmount)}</div>
                        <div className="text-sm text-muted-foreground">Total a Pagar</div>
                      </div>
                      <div>
                        <div className="font-medium text-lg">{selectedLoan.interestRate.weeksCount}</div>
                        <div className="text-sm text-muted-foreground">Semanas</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="font-medium">
                        Cuota Semanal: {formatCurrency(selectedLoan.weeklyPayment)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Del {formatDate(selectedLoan.loanDate)} al {formatDate(selectedLoan.dueDate)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creando Contrato...' : 'Crear Contrato'}
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
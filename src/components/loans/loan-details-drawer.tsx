'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, User, DollarSign, Calendar, Shield, Percent, CreditCard, CalendarIcon, Edit2, Check, X as XIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Loan {
  id: string
  amount: number
  weeklyPayment: number
  totalAmount: number
  paidAmount: number
  balance: number
  status: 'ACTIVE' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  loanDate: Date
  dueDate: Date
  completedAt?: Date | null
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
  payments: any[]
  _count: {
    payments: number
  }
}

interface LoanDetailsDrawerProps {
  loan: Loan | null
  open: boolean
  onClose: () => void
  onUpdateDueDate?: (loanId: string, newDueDate: Date) => Promise<void>
}

const statusLabels = {
  ACTIVE: { label: 'Activo', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
  PAID: { label: 'Pagado', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
  OVERDUE: { label: 'Vencido', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelado', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
}

export function LoanDetailsDrawer({ loan, open, onClose, onUpdateDueDate }: LoanDetailsDrawerProps) {
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isUpdating, setIsUpdating] = useState(false)
  
  if (!loan) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const calculateProgress = () => {
    return (loan.paidAmount / loan.totalAmount) * 100
  }

  const isOverdue = () => {
    return new Date() > new Date(loan.dueDate) && loan.status === 'ACTIVE'
  }

  const calculateInterestRate = () => {
    return ((loan.totalAmount - loan.amount) / loan.amount) * 100
  }

  const getRemainingWeeks = () => {
    if (loan.status === 'PAID') return 0
    const today = new Date()
    const dueDate = new Date(loan.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.max(0, diffWeeks)
  }

  const handleEditDate = () => {
    setSelectedDate(new Date(loan.dueDate))
    setIsEditingDate(true)
  }

  const handleCancelEdit = () => {
    setIsEditingDate(false)
    setSelectedDate(undefined)
  }

  const handleSaveDate = async () => {
    if (!selectedDate || !onUpdateDueDate) return
    
    setIsUpdating(true)
    try {
      await onUpdateDueDate(loan.id, selectedDate)
      setIsEditingDate(false)
      setSelectedDate(undefined)
    } catch (error) {
      console.error('Error updating due date:', error)
      alert('Error al actualizar la fecha de vencimiento')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalles del Préstamo
              </SheetTitle>
              <SheetDescription>
                ID: {loan.id.slice(-8).toUpperCase()}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusLabels[loan.status].color}>
              {statusLabels[loan.status].label}
            </Badge>
            {isOverdue() && (
              <Badge className="bg-orange-100 text-orange-800">
                Vencido
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium text-lg">
                  {loan.client.firstName} {loan.client.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {loan.client.email && (
                    <div>📧 {loan.client.email}</div>
                  )}
                  {loan.client.phone && (
                    <div>📞 {loan.client.phone}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Resumen Financiero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Monto Original</div>
                  <div className="font-bold text-lg">{formatCurrency(loan.amount)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total a Pagar</div>
                  <div className="font-bold text-lg">{formatCurrency(loan.totalAmount)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Pagado</div>
                  <div className="font-bold text-lg text-green-600">{formatCurrency(loan.paidAmount)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Saldo Pendiente</div>
                  <div className="font-bold text-lg text-red-600">{formatCurrency(loan.balance)}</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del Préstamo</span>
                  <span>{calculateProgress().toFixed(1)}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Detalles de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Pago Semanal</div>
                  <div className="font-bold">{formatCurrency(loan.weeklyPayment)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Semanas Totales</div>
                  <div className="font-bold">{loan.interestRate.weeksCount} semanas</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Fecha de Préstamo</div>
                  <div className="font-medium">
                    {format(new Date(loan.loanDate), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Fecha de Vencimiento</div>
                  <div className="flex items-center gap-2">
                    {!isEditingDate ? (
                      <>
                        <div className={`font-medium ${isOverdue() ? 'text-red-600' : ''}`}>
                          {format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        {onUpdateDueDate && loan.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleEditDate}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[140px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date("1900-01-01")}
                              locale={es}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleSaveDate}
                          disabled={!selectedDate || isUpdating}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleCancelEdit}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Semanas Restantes</div>
                    <div className="font-bold">
                      {loan.status === 'PAID' ? '0' : `${getRemainingWeeks()} semanas`}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Pagos Registrados</div>
                    <div className="font-bold">{loan._count.payments} pagos</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interest Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Percent className="h-4 w-4" />
                Información de Intereses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tasa de Interés Total</span>
                  <span className="font-bold text-red-600">
                    {calculateInterestRate().toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Intereses</span>
                  <span className="font-bold">
                    {formatCurrency(loan.totalAmount - loan.amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guarantee Information */}
          {loan.guarantee && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Información de Garantía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{loan.guarantee.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Valor estimado: {formatCurrency(loan.guarantee.value)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Info */}
          {loan.status === 'PAID' && loan.completedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-green-600">
                  ✅ Préstamo Completado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Completado el {format(new Date(loan.completedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
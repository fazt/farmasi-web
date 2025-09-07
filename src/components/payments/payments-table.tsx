'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Eye, Receipt } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Payment {
  id: string
  amount: number
  paymentDate: Date
  createdAt: Date
  loan: {
    id: string
    amount: number
    weeklyPayment: number
    totalAmount: number
    paidAmount: number
    balance: number
    status: string
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
  }
}

interface PaymentsTableProps {
  payments: Payment[]
  onDelete: (id: string) => void
  onView: (payment: Payment) => void
  isLoading?: boolean
}

export function PaymentsTable({
  payments,
  onDelete,
  onView,
  isLoading,
}: PaymentsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const getPaymentType = (payment: Payment) => {
    const { loan } = payment
    const weeklyPayment = loan.interestRate.weeklyPayment
    
    if (payment.amount === weeklyPayment) {
      return { label: 'Cuota Regular', variant: 'default' as const }
    } else if (payment.amount > weeklyPayment) {
      return { label: 'Pago Adelantado', variant: 'secondary' as const }
    } else if (payment.amount === loan.balance + payment.amount) {
      return { label: 'Pago Final', variant: 'outline' as const }
    } else {
      return { label: 'Pago Parcial', variant: 'destructive' as const }
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando pagos...</div>
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay pagos registrados
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Tipo de Pago</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead>Estado del Préstamo</TableHead>
              <TableHead>Saldo Restante</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const paymentType = getPaymentType(payment)
              
              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{`${payment.loan.client.firstName} ${payment.loan.client.lastName}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {payment.loan.client.email || payment.loan.client.phone || 'Sin contacto'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cuota: {formatCurrency(payment.loan.interestRate.weeklyPayment)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentType.variant}>
                      {paymentType.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.paymentDate), 'dd/MM/yyyy', {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      payment.loan.status === 'PAID' ? 'default' : 
                      payment.loan.status === 'ACTIVE' ? 'secondary' : 'destructive'
                    }>
                      {payment.loan.status === 'PAID' ? 'Pagado' :
                       payment.loan.status === 'ACTIVE' ? 'Activo' : 
                       payment.loan.status === 'OVERDUE' ? 'Vencido' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${
                      payment.loan.balance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(payment.loan.balance)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      de {formatCurrency(payment.loan.totalAmount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(payment)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => console.log('Generate receipt:', payment)}
                        title="Generar recibo"
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(payment.id)}
                        title="Eliminar pago"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pago será eliminado
              y se actualizará el saldo del préstamo correspondiente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
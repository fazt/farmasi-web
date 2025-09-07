'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Trash2, Eye, Calendar, DollarSign } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface LoansTableProps {
  loans: Loan[]
  onEdit: (loan: Loan) => void
  onDelete: (id: string) => void
  onView: (loan: Loan) => void
  onStatusChange?: (id: string, status: string) => void
  isLoading?: boolean
}

const statusLabels = {
  ACTIVE: { label: 'Activo', variant: 'default' as const, color: 'text-green-600' },
  PAID: { label: 'Pagado', variant: 'secondary' as const, color: 'text-blue-600' },
  OVERDUE: { label: 'Vencido', variant: 'destructive' as const, color: 'text-red-600' },
  CANCELLED: { label: 'Cancelado', variant: 'outline' as const, color: 'text-gray-600' },
}

export function LoansTable({
  loans,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  isLoading,
}: LoansTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const handleStatusChange = (loanId: string, newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(loanId, newStatus)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const isOverdue = (loan: Loan) => {
    if (loan.status === 'PAID' || loan.status === 'CANCELLED') return false
    return new Date() > new Date(loan.dueDate)
  }

  const calculateProgress = (paidAmount: number, totalAmount: number) => {
    return (paidAmount / totalAmount) * 100
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando préstamos...</div>
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay préstamos registrados
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
              <TableHead>Pagado</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const statusInfo = statusLabels[loan.status]
              const overdue = isOverdue(loan)
              const progress = calculateProgress(loan.paidAmount, loan.totalAmount)
              const canDelete = loan._count.payments === 0

              return (
                <TableRow key={loan.id} className={overdue && loan.status === 'ACTIVE' ? 'bg-red-50 dark:bg-red-950/10' : ''}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{`${loan.client.firstName} ${loan.client.lastName}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {loan.client.email || loan.client.phone || 'Sin contacto'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(loan.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(loan.weeklyPayment)}/sem × {loan.interestRate.weeksCount}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(loan.paidAmount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {loan._count.payments} pago(s)
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${loan.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(loan.balance)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress >= 100 ? 'bg-green-500' : 
                            progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-center font-medium">
                        {progress.toFixed(0)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={loan.status} 
                      onValueChange={(newStatus) => handleStatusChange(loan.id, newStatus)}
                      disabled={!onStatusChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          <div className="flex items-center">
                            <Badge variant="default">Activo</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="PAID">
                          <div className="flex items-center">
                            <Badge variant="secondary">Pagado</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="OVERDUE">
                          <div className="flex items-center">
                            <Badge variant="destructive">Vencido</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center">
                            <Badge variant="outline">Cancelado</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className={overdue ? 'text-red-600 font-medium' : ''}>
                      {format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    {overdue && loan.status === 'ACTIVE' && (
                      <div className="text-xs text-red-500">¡Vencido!</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(loan)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {loan.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(loan)}
                          title="Registrar pago"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(loan.id)}
                        disabled={!canDelete}
                        title={
                          !canDelete
                            ? 'No se puede eliminar un préstamo con pagos'
                            : 'Eliminar préstamo'
                        }
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
              Esta acción no se puede deshacer. El préstamo será eliminado
              permanentemente del sistema y la garantía quedará disponible nuevamente.
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
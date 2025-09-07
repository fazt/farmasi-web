'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
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

interface InterestRate {
  id: string
  loanAmount: number
  weeklyPayment: number
  weeksCount: number
  isActive: boolean
  createdAt: Date
  _count: {
    loans: number
  }
}

interface InterestRatesTableProps {
  interestRates: InterestRate[]
  onEdit: (interestRate: InterestRate) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  isLoading?: boolean
}

export function InterestRatesTable({
  interestRates,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading,
}: InterestRatesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const calculateTotalPayment = (weeklyPayment: number, weeks: number) => {
    return Number(weeklyPayment) * Number(weeks)
  }

  const calculateInterestRate = (loanAmount: number, totalPayment: number) => {
    const loan = Number(loanAmount)
    const total = Number(totalPayment)
    return ((total - loan) / loan) * 100
  }

  const formatCurrency = (value: any) => {
    const num = Number(value) || 0
    return `S/. ${num.toFixed(2)}`
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando tasas de interés...</div>
  }

  if (interestRates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay tasas de interés registradas
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Monto Préstamo</TableHead>
              <TableHead>Pago Semanal</TableHead>
              <TableHead>Semanas</TableHead>
              <TableHead>Total a Pagar</TableHead>
              <TableHead>Tasa Interés</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Préstamos</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interestRates.map((rate) => {
              const totalPayment = calculateTotalPayment(rate.weeklyPayment, rate.weeksCount)
              const interestRate = calculateInterestRate(rate.loanAmount, totalPayment)
              
              return (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">
                    {formatCurrency(rate.loanAmount)}
                  </TableCell>
                  <TableCell>{formatCurrency(rate.weeklyPayment)}</TableCell>
                  <TableCell>{Number(rate.weeksCount) || 0}</TableCell>
                  <TableCell>{formatCurrency(totalPayment)}</TableCell>
                  <TableCell className="font-medium">
                    {(Number(interestRate) || 0).toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={rate.isActive ? 'default' : 'secondary'}>
                      {rate.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {rate._count.loans} préstamo(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(rate.createdAt), 'dd/MM/yyyy', {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStatus(rate.id, !rate.isActive)}
                        title={rate.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {rate.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(rate.id)}
                        disabled={rate._count.loans > 0}
                        title={
                          rate._count.loans > 0
                            ? 'No se puede eliminar una tasa con préstamos asociados'
                            : 'Eliminar tasa de interés'
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
              Esta acción no se puede deshacer. La tasa de interés será eliminada
              permanentemente del sistema.
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
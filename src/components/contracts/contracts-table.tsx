'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Trash2, Eye, Download, Mail, FileText } from 'lucide-react'
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

interface Contract {
  id: string
  startDate: Date
  endDate: Date
  amount: number
  interest: number
  installments: number
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  signature?: string | null
  createdAt: Date
  client: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
  }
  loan: {
    id: string
    amount: number
    weeklyPayment: number
    totalAmount: number
    status: string
    interestRate: {
      weeksCount: number
    }
    payments: any[]
  }
  guarantee: {
    id: string
    name: string
    value: number
  }
}

interface ContractsTableProps {
  contracts: Contract[]
  onEdit: (contract: Contract) => void
  onDelete: (id: string) => void
  onView: (contract: Contract) => void
  onDownloadPDF: (contract: Contract) => void
  onSendEmail?: (contract: Contract) => void
  isLoading?: boolean
}

const statusLabels = {
  ACTIVE: { label: 'Activo', variant: 'default' as const },
  COMPLETED: { label: 'Completado', variant: 'secondary' as const },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
}

export function ContractsTable({
  contracts,
  onEdit,
  onDelete,
  onView,
  onDownloadPDF,
  onSendEmail,
  isLoading,
}: ContractsTableProps) {
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

  const getContractProgress = (contract: Contract) => {
    const totalPayments = contract.loan.payments.length
    const totalInstallments = contract.installments
    return (totalPayments / totalInstallments) * 100
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando contratos...</div>
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay contratos registrados
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
              <TableHead>Total</TableHead>
              <TableHead>Cuotas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Garantía</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => {
              const statusInfo = statusLabels[contract.status]
              const progress = getContractProgress(contract)
              const totalAmount = contract.amount + contract.interest

              return (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{`${contract.client.firstName} ${contract.client.lastName}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {contract.client.email || contract.client.phone || 'Sin contacto'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(contract.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      Capital inicial
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">
                      + {formatCurrency(contract.interest)} interés
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{contract.installments}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(contract.loan.weeklyPayment)}/sem
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
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
                        {contract.loan.payments.length}/{contract.installments}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(contract.startDate), 'dd/MM/yy', { locale: es })} - 
                      {format(new Date(contract.endDate), 'dd/MM/yy', { locale: es })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))} semanas
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[120px]">
                      <div className="truncate text-sm" title={contract.guarantee.name}>
                        {contract.guarantee.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(contract.guarantee.value)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(contract)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownloadPDF(contract)}
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {onSendEmail && contract.client.email && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSendEmail(contract)}
                          title="Enviar por email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(contract)}
                        title="Editar contrato"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(contract.id)}
                        title="Eliminar contrato"
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
              Esta acción no se puede deshacer. El contrato será eliminado
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
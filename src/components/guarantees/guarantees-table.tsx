'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Trash2, Eye } from 'lucide-react'
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

interface Guarantee {
  id: string
  name: string
  value: number
  status: 'ACTIVE' | 'USED' | 'INACTIVE'
  createdAt: Date
  _count: {
    loans: number
    contracts: number
  }
}

interface GuaranteesTableProps {
  guarantees: Guarantee[]
  onEdit: (guarantee: Guarantee) => void
  onDelete: (id: string) => void
  onView: (guarantee: Guarantee) => void
  isLoading?: boolean
}


export function GuaranteesTable({
  guarantees,
  onEdit,
  onDelete,
  onView,
  isLoading,
}: GuaranteesTableProps) {
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

  if (isLoading) {
    return <div className="text-center py-8">Cargando garantías...</div>
  }

  if (guarantees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay garantías registradas
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Préstamos</TableHead>
              <TableHead>Contratos</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guarantees.map((guarantee) => {
              const canDelete = guarantee._count.loans === 0 && guarantee._count.contracts === 0

              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'ACTIVE':
                    return <Badge variant="default" className="bg-green-100 text-green-800">Disponible</Badge>
                  case 'USED':
                    return <Badge variant="secondary" className="bg-orange-100 text-orange-800">En Uso</Badge>
                  case 'INACTIVE':
                    return <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactiva</Badge>
                  default:
                    return <Badge variant="secondary">{status}</Badge>
                }
              }

              return (
                <TableRow key={guarantee.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={guarantee.name}>
                      {guarantee.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(guarantee.value)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(guarantee.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {guarantee._count.loans}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {guarantee._count.contracts}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(guarantee.createdAt), 'dd/MM/yyyy', {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(guarantee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(guarantee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(guarantee.id)}
                        disabled={!canDelete}
                        title={
                          !canDelete
                            ? 'No se puede eliminar una garantía en uso'
                            : 'Eliminar garantía'
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
              Esta acción no se puede deshacer. La garantía será eliminada
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
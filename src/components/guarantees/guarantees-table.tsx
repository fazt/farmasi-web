'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Trash2, Eye, Image } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Guarantee {
  id: string
  name: string
  value: number
  photo?: string | null
  description?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'USED'
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

const statusLabels = {
  ACTIVE: { label: 'Activa', variant: 'default' as const },
  INACTIVE: { label: 'Inactiva', variant: 'secondary' as const },
  USED: { label: 'En Uso', variant: 'outline' as const },
}

export function GuaranteesTable({
  guarantees,
  onEdit,
  onDelete,
  onView,
  isLoading,
}: GuaranteesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)

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
              <TableHead>Foto</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guarantees.map((guarantee) => {
              const statusInfo = statusLabels[guarantee.status]
              const canDelete = guarantee._count.loans === 0 && guarantee._count.contracts === 0

              return (
                <TableRow key={guarantee.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={guarantee.name}>
                      {guarantee.name}
                    </div>
                    {guarantee.description && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {guarantee.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(guarantee.value)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
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
                    {guarantee.photo ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewPhoto(guarantee.photo!)}
                        className="h-8 w-8"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin foto</span>
                    )}
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

      <Dialog open={!!viewPhoto} onOpenChange={() => setViewPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Foto de la Garantía</DialogTitle>
          </DialogHeader>
          {viewPhoto && (
            <div className="flex justify-center">
              <img
                src={viewPhoto}
                alt="Garantía"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.png'
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Trash2, Eye, User, FileText, CreditCard, Settings } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { ClientDetailsDrawer } from './client-details-drawer'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  documentType?: string | null
  documentNumber?: string | null
  createdAt: Date
  _count: {
    loans: number
  }
}

interface ClientsTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (id: string) => void
  onView: (client: Client) => void
  isLoading?: boolean
}

export function ClientsTable({
  clients,
  onEdit,
  onDelete,
  onView,
  isLoading,
}: ClientsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const router = useRouter()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
  }

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando clientes...</div>
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay clientes registrados
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Nombre</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documento</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Préstamos</span>
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Acciones</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700">
                        {getInitials(client.firstName, client.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{`${client.firstName} ${client.lastName}`}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {client.documentType && client.documentNumber ? (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {client.documentType}
                      </Badge>
                      <span>{client.documentNumber}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No registrado</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600">
                    {client._count.loans} préstamo(s)
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewClient(client)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(client.id)}
                      disabled={client._count.loans > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente será eliminado
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

      <ClientDetailsDrawer
        client={viewClient}
        isOpen={!!viewClient}
        onClose={() => setViewClient(null)}
        onEdit={onEdit}
        onViewDetails={onView}
      />
    </>
  )
}
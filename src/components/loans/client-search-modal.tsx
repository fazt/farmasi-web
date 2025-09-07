'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Phone, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  documentType: string
  documentNumber: string
}

interface ClientSearchModalProps {
  selectedClient?: Client | null
  onClientSelect: (client: Client) => void
  disabled?: boolean
  excludeClientId?: string
  placeholder?: string
  triggerText?: string
}

export function ClientSearchModal({ 
  selectedClient, 
  onClientSelect, 
  disabled, 
  excludeClientId,
  placeholder = "Buscar clientes...",
  triggerText 
}: ClientSearchModalProps) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && clients.length === 0) {
      fetchClients()
    }
  }, [open])

  useEffect(() => {
    let clientsToFilter = clients
    
    // Exclude the specified client if provided
    if (excludeClientId) {
      clientsToFilter = clients.filter(client => client.id !== excludeClientId)
    }
    
    if (searchTerm.trim() === '') {
      setFilteredClients(clientsToFilter)
    } else {
      const filtered = clientsToFilter.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.documentNumber.includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      )
      setFilteredClients(filtered)
    }
  }, [searchTerm, clients, excludeClientId])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clients?limit=100')
      const data = await response.json()
      setClients(data.clients || [])
      setFilteredClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClientSelect = (client: Client) => {
    onClientSelect(client)
    setOpen(false)
    setSearchTerm('')
  }

  const getDocumentBadgeColor = (type: string) => {
    switch (type) {
      case 'DNI':
        return 'bg-blue-100 text-blue-700'
      case 'CE':
        return 'bg-green-100 text-green-700'
      case 'PASAPORTE':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          <Users className="mr-2 h-4 w-4" />
          {selectedClient 
            ? `${selectedClient.firstName} ${selectedClient.lastName}`
            : (triggerText || "Seleccione un cliente")
          }
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Seleccionar Cliente</span>
          </DialogTitle>
          <DialogDescription>
            Busque y seleccione el cliente que recibirá el préstamo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder || "Buscar por nombre, documento, email o teléfono..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <Card 
                  key={client.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleClientSelect(client)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-lg">
                            {client.firstName} {client.lastName}
                          </h3>
                          <Badge className={getDocumentBadgeColor(client.documentType)}>
                            {client.documentType}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Documento:</span>
                            <span>{client.documentNumber}</span>
                          </div>
                          {client.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No se encontraron clientes con ese criterio de búsqueda' : 'No hay clientes registrados'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
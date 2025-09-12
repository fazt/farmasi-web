'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  User, 
  CreditCard, 
  Shield, 
  Calendar, 
  DollarSign, 
  Edit, 
  ExternalLink,
  Phone,
  Mail,
  FileText,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  documentType?: string | null
  documentNumber?: string | null
  address?: string | null
  createdAt: Date
}

interface ClientDetails extends Client {
  loans?: Array<{
    id: string
    amount: number
    weeklyPayment: number
    totalAmount: number
    paidAmount: number
    balance: number
    status: string
    startDate: Date
    interestRate: {
      loanAmount: number
      weeklyPayment: number
      weeksCount: number
    }
    payments: Array<{
      id: string
      amount: number
      paymentDate: Date
      status: string
      weekNumber: number
      dueDate: Date
    }>
  }>
  guarantees?: Array<{
    id: string
    name?: string
    description?: string
    type?: string
    brand?: string
    model?: string
    estimatedValue?: number
    createdAt: Date
  }>
  contracts?: Array<{
    id: string
    createdAt: Date
    loan: {
      amount: number
    }
  }>
}

interface ClientDetailsDrawerProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onEdit: (client: Client) => void
  onViewDetails: (client: Client) => void
}

export function ClientDetailsDrawer({
  client,
  isOpen,
  onClose,
  onEdit,
  onViewDetails,
}: ClientDetailsDrawerProps) {
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (client && isOpen) {
      fetchClientDetails(client.id)
    }
  }, [client, isOpen])

  const fetchClientDetails = async (clientId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clients/${clientId}/details`)
      
      if (response.ok) {
        const data = await response.json()
        setClientDetails(data)
      } else {
        console.error('Error fetching client details')
      }
    } catch (error) {
      console.error('Error fetching client details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, label: 'Activo' },
      COMPLETED: { variant: 'secondary' as const, label: 'Completado' },
      OVERDUE: { variant: 'destructive' as const, label: 'Vencido' },
      PENDING: { variant: 'outline' as const, label: 'Pendiente' },
      PAID: { variant: 'secondary' as const, label: 'Pagado' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (!client) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-xl">Información del Cliente</SheetTitle>
          
          {/* Client Header */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-semibold bg-blue-100 text-blue-700">
                {getInitials(client.firstName, client.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{`${client.firstName} ${client.lastName}`}</h2>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Cliente desde {format(new Date(client.createdAt), 'MMM yyyy', { locale: es })}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              {/* Personal Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-4 w-4" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Documento
                      </div>
                      {clientDetails?.documentType && clientDetails?.documentNumber ? (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{clientDetails.documentType}</Badge>
                          <span className="text-sm">{clientDetails.documentNumber}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No registrado</span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Phone className="h-3 w-3 mr-1" />
                        Teléfono
                      </div>
                      <span className="text-sm">{clientDetails?.phone || 'No registrado'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </div>
                    <span className="text-sm">{clientDetails?.email || 'No registrado'}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      Dirección
                    </div>
                    <span className="text-sm">{clientDetails?.address || 'No registrada'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {clientDetails?.loans?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Préstamos</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {clientDetails?.guarantees?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Garantías</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {clientDetails?.loans?.reduce((acc, loan) => acc + loan.payments.length, 0) || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Pagos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information Tabs */}
              <Tabs defaultValue="loans" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="loans" className="text-xs">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Préstamos
                  </TabsTrigger>
                  <TabsTrigger value="guarantees" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Garantías
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Pagos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="loans" className="space-y-3">
                  {clientDetails?.loans && clientDetails.loans.length > 0 ? (
                    clientDetails.loans.map((loan) => (
                      <Card key={loan.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{formatCurrency(loan.amount)}</div>
                            {getStatusBadge(loan.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Cuota semanal: {formatCurrency(loan.weeklyPayment)}</div>
                            <div>Balance: {formatCurrency(loan.balance)}</div>
                            <div>Inicio: {format(new Date(loan.startDate), 'dd MMM yyyy', { locale: es })}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No hay préstamos registrados</p>
                  )}
                </TabsContent>
                
                <TabsContent value="guarantees" className="space-y-3">
                  {clientDetails?.guarantees && clientDetails.guarantees.length > 0 ? (
                    clientDetails.guarantees.map((guarantee) => (
                      <Card key={guarantee.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{guarantee.name || guarantee.description || 'Sin nombre'}</div>
                            {guarantee.type && <Badge variant="outline">{guarantee.type}</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {guarantee.brand && <div>Marca: {guarantee.brand}</div>}
                            {guarantee.model && <div>Modelo: {guarantee.model}</div>}
                            {guarantee.estimatedValue && (
                              <div>Valor estimado: {formatCurrency(guarantee.estimatedValue)}</div>
                            )}
                            <div>Registrada: {format(new Date(guarantee.createdAt), 'dd MMM yyyy', { locale: es })}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No hay garantías registradas</p>
                  )}
                </TabsContent>
                
                <TabsContent value="payments" className="space-y-3">
                  {clientDetails?.loans && clientDetails.loans.some(loan => loan.payments.length > 0) ? (
                    clientDetails.loans.map((loan) => 
                      loan.payments.length > 0 && (
                        <div key={loan.id} className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Préstamo de {formatCurrency(loan.amount)}
                          </div>
                          {loan.payments.slice(0, 3).map((payment) => (
                            <Card key={payment.id}>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {format(new Date(payment.paymentDate), 'dd MMM yyyy', { locale: es })}
                                    </div>
                                  </div>
                                  {getStatusBadge(payment.status)}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {loan.payments.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              y {loan.payments.length - 3} pagos más...
                            </p>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No hay pagos registrados</p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-6 border-t mt-6">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              onEdit(client)
              onClose()
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="default" 
            className="flex-1"
            onClick={() => {
              onViewDetails(client)
              onClose()
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Detalles Completos
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
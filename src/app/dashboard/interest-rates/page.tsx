import { Calculator } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { InterestRatesClient } from '@/components/interest-rates/interest-rates-client'
import { prisma } from '@/lib/prisma'

export default async function InterestRatesPage() {
  // Fetch initial data on server side
  const interestRates = await prisma.interestRate.findMany({
    include: {
      _count: {
        select: {
          loans: true
        }
      }
    },
    orderBy: {
      loanAmount: 'asc'
    },
    take: 10
  })

  const totalRates = await prisma.interestRate.count()

  const pagination = {
    page: 1,
    limit: 10,
    total: totalRates,
    pages: Math.ceil(totalRates / 10)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasas de Interés</h1>
            <p className="text-muted-foreground">
              Administra las tasas de interés para los préstamos del sistema
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {totalRates} tasa(s) de interés
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Lista de Tasas de Interés
            </CardTitle>
            <CardDescription>
              Configura los montos de préstamo y pagos semanales correspondientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterestRatesClient 
              initialRates={interestRates} 
              initialPagination={pagination}
            />
          </CardContent>
        </Card>

        {/* Predefined rates information */}
        <Card>
          <CardHeader>
            <CardTitle>Tasas Predefinidas del Sistema</CardTitle>
            <CardDescription>
              Basado en los ejemplos del README, estas son las tasas de interés recomendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { amount: 500, payment: 105 },
                { amount: 600, payment: 110 },
                { amount: 700, payment: 145 },
                { amount: 800, payment: 165 },
                { amount: 1000, payment: 210 },
                { amount: 1500, payment: 320 },
              ].map((rate) => (
                <Card key={rate.amount} className="p-4">
                  <div className="text-center">
                    <div className="font-bold text-lg">S/. {rate.amount}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      S/. {rate.payment}/semana
                    </div>
                    <div className="text-xs">
                      {(((rate.payment * 6) - rate.amount) / rate.amount * 100).toFixed(1)}% interés
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
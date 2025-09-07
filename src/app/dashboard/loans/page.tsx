import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoansClient } from '@/components/loans/loans-client'
import { prisma } from '@/lib/prisma'

export default async function LoansPage() {
  // Fetch initial data on server side
  const loans = await prisma.loan.findMany({
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      interestRate: {
        select: {
          loanAmount: true,
          weeklyPayment: true,
          weeksCount: true
        }
      },
      guarantee: {
        select: {
          id: true,
          name: true,
          value: true
        }
      },
      payments: true,
      _count: {
        select: {
          payments: true
        }
      }
    },
    orderBy: {
      loanDate: 'desc'
    },
    take: 10
  })

  const totalLoans = await prisma.loan.count()

  const pagination = {
    page: 1,
    limit: 10,
    total: totalLoans,
    pages: Math.ceil(totalLoans / 10)
  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
            <p className="text-muted-foreground">
              Administra todos los préstamos del sistema
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {totalLoans} préstamo(s)
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Préstamos</CardTitle>
            <CardDescription>
              Busca y administra todos los préstamos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoansClient 
              initialLoans={loans} 
              initialPagination={pagination}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
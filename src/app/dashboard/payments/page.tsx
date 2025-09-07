import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PaymentsClient } from '@/components/payments/payments-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

interface Payment {
  id: string
  amount: number
  paymentDate: Date
  createdAt: Date
  loan: {
    id: string
    amount: number
    weeklyPayment: number
    totalAmount: number
    paidAmount: number
    balance: number
    status: string
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
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface PaymentStats {
  total: {
    amount: number
    count: number
    average: number
  }
  today: {
    amount: number
    count: number
  }
  week: {
    amount: number
    count: number
  }
}

async function getInitialData() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const limit = 10
  const page = 1
  const skip = (page - 1) * limit

  try {
    // Get current date boundaries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get week boundaries
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const [paymentsData, total, totalPayments, todayPayments, weekPayments] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          loan: {
            include: {
              client: true,
              interestRate: true,
            },
          },
        },
      }),
      prisma.payment.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          paymentDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          paymentDate: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      }),
    ])

    // Convert Decimal fields to numbers
    const payments = paymentsData.map(payment => ({
      ...payment,
      amount: Number(payment.amount),
      loan: {
        ...payment.loan,
        amount: Number(payment.loan.amount),
        weeklyPayment: Number(payment.loan.weeklyPayment),
        totalAmount: Number(payment.loan.totalAmount),
        paidAmount: Number(payment.loan.paidAmount),
        balance: Number(payment.loan.balance),
        interestRate: {
          ...payment.loan.interestRate,
          loanAmount: Number(payment.loan.interestRate.loanAmount),
          weeklyPayment: Number(payment.loan.interestRate.weeklyPayment),
        }
      }
    }))

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    const stats = {
      total: {
        amount: Number(totalPayments._sum.amount || 0),
        count: totalPayments._count.id,
        average: Number(totalPayments._avg.amount || 0),
      },
      today: {
        amount: Number(todayPayments._sum.amount || 0),
        count: todayPayments._count.id,
      },
      week: {
        amount: Number(weekPayments._sum.amount || 0),
        count: weekPayments._count.id,
      },
    }

    return { payments, pagination, stats }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    return {
      payments: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      stats: {
        total: { amount: 0, count: 0, average: 0 },
        today: { amount: 0, count: 0 },
        week: { amount: 0, count: 0 },
      }
    }
  }
}

export default async function PaymentsPage() {
  const { payments, pagination, stats } = await getInitialData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">
            Registra y administra todos los pagos de préstamos
          </p>
        </div>

        <PaymentsClient 
          initialPayments={payments}
          initialPagination={pagination}
          initialStats={stats}
        />
      </div>
    </DashboardLayout>
  )
}
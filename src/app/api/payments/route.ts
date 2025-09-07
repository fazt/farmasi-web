import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { paymentSchema } from '@/lib/validations/payment'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const loanId = searchParams.get('loanId') || ''
    const group = searchParams.get('group') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { loan: { client: { firstName: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { lastName: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { email: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { phone: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { documentNumber: { contains: search, mode: 'insensitive' as const } } } },
      ]
    }

    if (loanId) {
      where.loanId = loanId
    }

    // Filter by group (week number) if specified
    if (group) {
      const weekNumber = parseInt(group)
      const currentYear = new Date().getFullYear()
      
      // Calculate week date range
      const startOfYear = new Date(currentYear, 0, 1)
      const firstSunday = new Date(startOfYear)
      const dayOfWeek = startOfYear.getDay()
      if (dayOfWeek !== 0) {
        firstSunday.setDate(startOfYear.getDate() - dayOfWeek)
      }
      
      const weekStart = new Date(firstSunday)
      weekStart.setDate(firstSunday.getDate() + (weekNumber - 1) * 7)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      where.paymentDate = {
        gte: weekStart,
        lte: weekEnd,
      }
    }

    const [paymentsData, total] = await Promise.all([
      prisma.payment.findMany({
        where,
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
      prisma.payment.count({ where }),
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

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Validate loan exists and is active
    const loan = await prisma.loan.findUnique({
      where: { id: validatedData.loanId },
      include: { 
        client: true,
        interestRate: true,
      },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    if (loan.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: 'Solo se pueden registrar pagos en préstamos activos' 
      }, { status: 400 })
    }

    if (Number(validatedData.amount) > Number(loan.balance)) {
      return NextResponse.json({ 
        error: 'El monto del pago no puede ser mayor al saldo pendiente' 
      }, { status: 400 })
    }

    // Create payment and update loan in transaction
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: validatedData,
        include: {
          loan: {
            include: {
              client: true,
              interestRate: true,
            },
          },
        },
      })

      // Update loan amounts - convert Decimals to numbers for arithmetic
      const newPaidAmount = Number(loan.paidAmount) + Number(validatedData.amount)
      const newBalance = Number(loan.totalAmount) - newPaidAmount
      
      // Get total number of payments made (including this one)
      const totalPayments = await tx.payment.count({
        where: { loanId: validatedData.loanId }
      })
      
      // A loan is fully paid if the balance is 0 or less
      // This allows for advance payments (paying the full amount before 6 weeks)
      const isFullyPaid = newBalance <= 0

      await tx.loan.update({
        where: { id: validatedData.loanId },
        data: {
          paidAmount: newPaidAmount,
          balance: Math.max(newBalance, 0),
          status: isFullyPaid ? 'PAID' : 'ACTIVE',
          completedAt: isFullyPaid ? new Date() : null,
        },
      })

      // Note: Loan is marked as PAID, guarantee is automatically available for reuse

      return newPayment
    })

    // Convert Decimal fields to numbers for serialization
    const serializedPayment = {
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
    }

    return NextResponse.json(serializedPayment)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Error al registrar el pago' },
      { status: 500 }
    )
  }
}
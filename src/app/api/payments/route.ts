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

    const [payments, total] = await Promise.all([
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
      include: { client: true },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    if (loan.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: 'Solo se pueden registrar pagos en préstamos activos' 
      }, { status: 400 })
    }

    if (validatedData.amount > loan.balance) {
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

      // Update loan amounts
      const newPaidAmount = loan.paidAmount + validatedData.amount
      const newBalance = loan.totalAmount - newPaidAmount
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

      // If loan is fully paid, release the guarantee
      if (isFullyPaid) {
        await tx.guarantee.update({
          where: { id: loan.guaranteeId },
          data: { status: 'ACTIVE' },
        })
      }

      return newPayment
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Error al registrar el pago' },
      { status: 500 }
    )
  }
}
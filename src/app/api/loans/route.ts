import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addWeeks } from 'date-fns'

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
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('clientId') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { client: { firstName: { contains: search, mode: 'insensitive' as const } } },
        { client: { lastName: { contains: search, mode: 'insensitive' as const } } },
        { client: { email: { contains: search, mode: 'insensitive' as const } } },
        { client: { phone: { contains: search, mode: 'insensitive' as const } } },
        { client: { documentNumber: { contains: search, mode: 'insensitive' as const } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          interestRate: true,
          guarantee: true,
          payments: {
            orderBy: { paymentDate: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
      }),
      prisma.loan.count({ where }),
    ])

    return NextResponse.json({
      loans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching loans:', error)
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
    const { clientId, interestRateId, guaranteeId } = body

    // Validate that client, interest rate and guarantee exist
    const [client, interestRate, guarantee] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.interestRate.findUnique({ where: { id: interestRateId } }),
      prisma.guarantee.findUnique({ where: { id: guaranteeId } }),
    ])

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (!interestRate || !interestRate.isActive) {
      return NextResponse.json({ error: 'Tasa de interés no válida' }, { status: 404 })
    }

    if (!guarantee) {
      return NextResponse.json({ error: 'Garantía no encontrada' }, { status: 404 })
    }

    // Check if client has any active loans
    const activeLoans = await prisma.loan.count({
      where: {
        clientId,
        status: { not: 'PAID' },
      },
    })

    if (activeLoans > 0) {
      return NextResponse.json(
        { error: 'El cliente ya tiene préstamos activos' },
        { status: 400 }
      )
    }

    const amount = interestRate.loanAmount
    const weeklyPayment = interestRate.weeklyPayment
    const totalAmount = weeklyPayment * interestRate.weeksCount
    const loanDate = new Date()
    const dueDate = addWeeks(loanDate, interestRate.weeksCount)

    // Create loan and update guarantee status in a transaction
    const loan = await prisma.$transaction(async (tx) => {
      const newLoan = await tx.loan.create({
        data: {
          clientId,
          interestRateId,
          guaranteeId,
          amount,
          weeklyPayment,
          totalAmount,
          balance: totalAmount,
          paidAmount: 0,
          status: 'ACTIVE',
          loanDate,
          dueDate,
        },
        include: {
          client: true,
          interestRate: true,
          guarantee: true,
        },
      })

      // Note: Guarantee is now linked to loan, no status field needed

      return newLoan
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Error al crear el préstamo' },
      { status: 500 }
    )
  }
}
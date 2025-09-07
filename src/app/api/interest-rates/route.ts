import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { interestRateSchema } from '@/lib/validations/interest-rate'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const activeOnly = searchParams.get('active') === 'true'

    const skip = (page - 1) * limit

    const where = activeOnly ? { isActive: true } : {}

    const [interestRates, total] = await Promise.all([
      prisma.interestRate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { loanAmount: 'asc' },
        include: {
          _count: {
            select: {
              loans: true,
            },
          },
        },
      }),
      prisma.interestRate.count({ where }),
    ])

    return NextResponse.json({
      interestRates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching interest rates:', error)
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
    const validatedData = interestRateSchema.parse(body)

    // Check if interest rate with same loan amount already exists
    const existingRate = await prisma.interestRate.findFirst({
      where: { 
        loanAmount: validatedData.loanAmount,
        isActive: true,
      },
    })

    if (existingRate) {
      return NextResponse.json(
        { error: 'Ya existe una tasa de interés para este monto' },
        { status: 400 }
      )
    }

    const interestRate = await prisma.interestRate.create({
      data: validatedData,
    })

    return NextResponse.json(interestRate)
  } catch (error) {
    console.error('Error creating interest rate:', error)
    return NextResponse.json(
      { error: 'Error al crear la tasa de interés' },
      { status: 500 }
    )
  }
}
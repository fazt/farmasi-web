import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contractSchema } from '@/lib/validations/contract'

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

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

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          loan: {
            include: {
              interestRate: true,
              payments: true,
            },
          },
          guarantee: true,
          template: true,
        },
      }),
      prisma.contract.count({ where }),
    ])

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Remove auth check for now
    // const session = await getServerSession(authOptions)
    // 
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Handle both JSON and FormData
    let body: any
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData()
      const contractDataString = formData.get('contractData') as string
      
      if (!contractDataString) {
        return NextResponse.json({ error: 'Missing contract data' }, { status: 400 })
      }
      
      body = JSON.parse(contractDataString)
      
      // Handle file uploads if present
      const idPhotoFront = formData.get('idPhotoFront') as File
      const idPhotoBack = formData.get('idPhotoBack') as File
      
      // TODO: Handle file storage here if needed
      console.log('ID Photos received:', {
        front: idPhotoFront?.name,
        back: idPhotoBack?.name
      })
    } else {
      // Handle JSON
      body = await request.json()
    }
    
    // If creating from loan, get loan data
    if (body.loanId && !body.clientId) {
      const loan = await prisma.loan.findUnique({
        where: { id: body.loanId },
        include: {
          client: true,
          interestRate: true,
          guarantee: true,
        },
      })

      if (!loan) {
        return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
      }

      // Auto-fill contract data from loan
      body.clientId = loan.clientId
      body.guaranteeId = loan.guaranteeId
      body.amount = loan.amount
      body.interest = loan.totalAmount - loan.amount
      body.installments = loan.interestRate.weeksCount
      body.endDate = loan.dueDate
    }

    const validatedData = contractSchema.parse(body)

    // Validate that client, loan and guarantee exist
    const [client, loan, guarantee] = await Promise.all([
      prisma.client.findUnique({ where: { id: validatedData.clientId } }),
      prisma.loan.findUnique({ where: { id: validatedData.loanId } }),
      prisma.guarantee.findUnique({ where: { id: validatedData.guaranteeId } }),
    ])

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (!loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    if (!guarantee) {
      return NextResponse.json({ error: 'Garantía no encontrada' }, { status: 404 })
    }

    // Check if contract already exists for this loan
    const existingContract = await prisma.contract.findFirst({
      where: { loanId: validatedData.loanId },
    })

    if (existingContract) {
      return NextResponse.json(
        { error: 'Ya existe un contrato para este préstamo' },
        { status: 400 }
      )
    }

    const contract = await prisma.contract.create({
      data: validatedData,
      include: {
        client: true,
        loan: {
          include: {
            interestRate: true,
          },
        },
        guarantee: true,
        template: true,
      },
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { error: 'Error al crear el contrato' },
      { status: 500 }
    )
  }
}
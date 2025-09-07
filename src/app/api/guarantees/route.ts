import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { guaranteeSchema } from '@/lib/validations/guarantee'

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

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [guarantees, total] = await Promise.all([
      prisma.guarantee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              loans: true,
              contracts: true,
            },
          },
        },
      }),
      prisma.guarantee.count({ where }),
    ])

    return NextResponse.json({
      guarantees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching guarantees:', error)
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
    
    // Validar los datos con Zod
    const validatedData = guaranteeSchema.parse(body)

    // Separar los datos que van directamente a la base de datos
    const { photos, ...guaranteeData } = validatedData

    // Crear la garantía en la base de datos (sin el campo photos)
    const guarantee = await prisma.guarantee.create({
      data: guaranteeData,
    })
    
    return NextResponse.json(guarantee)
    
  } catch (error: any) {
    console.error('Error creating guarantee:', error)
    
    // Errores de validación de Zod
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: 'Errores de validación', 
          details: validationErrors,
          message: validationErrors.map((e: any) => `${e.field}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }
    
    // Errores de Prisma
    if (error.code) {
      return NextResponse.json(
        { error: `Error de base de datos: ${error.message}` },
        { status: 400 }
      )
    }
    
    // Error genérico
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
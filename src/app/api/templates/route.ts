import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const templateSchema = z.object({
  type: z.enum(['WHATSAPP', 'CONTRACT']),
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  name: z.string().optional(),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  richContent: z.string().optional(),
  category: z.string().optional(),
  variables: z.array(z.string()).default([]),
  metadata: z.any().optional(),
  isActive: z.boolean().default(true),
})

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
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    if (type) {
      where.type = type.toUpperCase()
    }

    if (category) {
      where.category = category
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.template.count({ where }),
    ])

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
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
    
    // Convert lowercase type to uppercase for database
    if (body.type) {
      body.type = body.type.toUpperCase()
    }
    
    // Validar los datos con Zod
    const validatedData = templateSchema.parse(body)

    // Extract variables from content using {{variable}} pattern
    const extractVariables = (content: string) => {
      const variableRegex = /\{\{(\w+)\}\}/g
      const matches = content.match(variableRegex) || []
      const extractedVariables = matches.map(match => match.replace(/[{}]/g, ''))
      return [...new Set(extractedVariables)] // Remove duplicates
    }

    // Extract variables from both content and richContent
    const contentVariables = extractVariables(validatedData.content)
    const richContentVariables = validatedData.richContent ? extractVariables(validatedData.richContent) : []
    const allVariables = [...new Set([...contentVariables, ...richContentVariables])]

    // Create the template
    const template = await prisma.template.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        name: validatedData.name,
        content: validatedData.content,
        richContent: validatedData.richContent,
        category: validatedData.category,
        variables: allVariables,
        metadata: validatedData.metadata,
        isActive: validatedData.isActive,
      },
    })
    
    return NextResponse.json(template)
    
  } catch (error: any) {
    console.error('Error creating template:', error)
    
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
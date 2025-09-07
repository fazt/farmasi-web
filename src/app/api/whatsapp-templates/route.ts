import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const whatsappTemplateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'La categoría es requerida'),
  variables: z.array(z.string()).default([]),
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
    const category = searchParams.get('category') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const [templates, total] = await Promise.all([
      prisma.whatsAppTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.whatsAppTemplate.count({ where }),
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
    console.error('Error fetching WhatsApp templates:', error)
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
    const validatedData = whatsappTemplateSchema.parse(body)

    // Extract variables from content using {{variable}} pattern
    const extractVariables = (content: string) => {
      const variableRegex = /\{\{(\w+)\}\}/g
      const matches = content.match(variableRegex) || []
      const extractedVariables = matches.map(match => match.replace(/[{}]/g, ''))
      return [...new Set(extractedVariables)] // Remove duplicates
    }

    const extractedVariables = extractVariables(validatedData.content)

    // Create the template
    const template = await prisma.whatsAppTemplate.create({
      data: {
        name: validatedData.name,
        content: validatedData.content,
        category: validatedData.category,
        variables: extractedVariables,
        isActive: validatedData.isActive,
      },
    })
    
    return NextResponse.json(template)
    
  } catch (error: any) {
    console.error('Error creating WhatsApp template:', error)
    
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
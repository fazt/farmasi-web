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

const whatsappTemplateUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres').optional(),
  category: z.string().min(1, 'La categoría es requerida').optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await prisma.whatsAppTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching WhatsApp template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify template exists
    const existingTemplate = await prisma.whatsAppTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = whatsappTemplateSchema.parse(body)

    // Extract variables from content using {{variable}} pattern
    const extractVariables = (content: string) => {
      const variableRegex = /\{\{(\w+)\}\}/g
      const matches = content.match(variableRegex) || []
      const extractedVariables = matches.map(match => match.replace(/[{}]/g, ''))
      return [...new Set(extractedVariables)] // Remove duplicates
    }

    const extractedVariables = extractVariables(validatedData.content)

    const template = await prisma.whatsAppTemplate.update({
      where: { id: params.id },
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
    console.error('Error updating WhatsApp template:', error)
    
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
    
    if (error.code) {
      return NextResponse.json(
        { error: `Error de base de datos: ${error.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify template exists
    const existingTemplate = await prisma.whatsAppTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = whatsappTemplateUpdateSchema.parse(body)

    // If content is being updated, extract variables
    let updateData: any = { ...validatedData }
    
    if (validatedData.content) {
      const extractVariables = (content: string) => {
        const variableRegex = /\{\{(\w+)\}\}/g
        const matches = content.match(variableRegex) || []
        const extractedVariables = matches.map(match => match.replace(/[{}]/g, ''))
        return [...new Set(extractedVariables)] // Remove duplicates
      }

      updateData.variables = extractVariables(validatedData.content)
    }

    const template = await prisma.whatsAppTemplate.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('Error updating WhatsApp template status:', error)
    
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
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify template exists
    const existingTemplate = await prisma.whatsAppTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    await prisma.whatsAppTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Plantilla eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting WhatsApp template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
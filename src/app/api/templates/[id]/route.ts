import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const templateUpdateSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').optional(),
  name: z.string().optional(),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres').optional(),
  richContent: z.string().optional(),
  category: z.string().optional(),
  variables: z.array(z.string()).optional(),
  metadata: z.any().optional(),
  isActive: z.boolean().optional(),
})

const templateStatusSchema = z.object({
  isActive: z.boolean(),
})

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await prisma.template.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar los datos con Zod
    const validatedData = templateUpdateSchema.parse(body)

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // Extract variables from content using {{variable}} pattern
    const extractVariables = (content: string) => {
      const variableRegex = /\{\{(\w+)\}\}/g
      const matches = content.match(variableRegex) || []
      const extractedVariables = matches.map(match => match.replace(/[{}]/g, ''))
      return [...new Set(extractedVariables)] // Remove duplicates
    }

    // Extract variables from both content and richContent if they are being updated
    let allVariables = existingTemplate.variables
    
    if (validatedData.content || validatedData.richContent) {
      const contentToCheck = validatedData.content || existingTemplate.content
      const richContentToCheck = validatedData.richContent || existingTemplate.richContent || ''
      
      const contentVariables = extractVariables(contentToCheck)
      const richContentVariables = richContentToCheck ? extractVariables(richContentToCheck) : []
      allVariables = [...new Set([...contentVariables, ...richContentVariables])]
    }

    // Update the template
    const template = await prisma.template.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        variables: allVariables,
      },
    })
    
    return NextResponse.json(template)
    
  } catch (error: any) {
    console.error('Error updating template:', error)
    
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar los datos con Zod (solo isActive para PATCH)
    const validatedData = templateStatusSchema.parse(body)

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // Update the template status
    const template = await prisma.template.update({
      where: { id: params.id },
      data: {
        isActive: validatedData.isActive,
      },
    })
    
    return NextResponse.json(template)
    
  } catch (error: any) {
    console.error('Error updating template status:', error)
    
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
    
    // Error genérico
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // Delete the template
    await prisma.template.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ message: 'Plantilla eliminada correctamente' })
    
  } catch (error: any) {
    console.error('Error deleting template:', error)
    
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
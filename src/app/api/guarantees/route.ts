import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guaranteeSchema } from '@/lib/validations/guarantee'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const availableOnly = searchParams.get('available') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}

    // Filter only available guarantees if requested
    if (availableOnly) {
      where.status = 'ACTIVE'
    }

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
          photos: true,
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
    const contentType = request.headers.get('content-type')
    let name: string
    let value: number
    let description: string | null = null
    let photos: File[] = []

    if (contentType?.includes('application/json')) {
      // Handle JSON data (from QuickGuaranteeModal)
      const data = await request.json()
      name = data.name
      value = parseFloat(data.value)
      description = data.description || null
    } else {
      // Handle FormData for file uploads
      const formData = await request.formData()
      
      // Extract basic data
      name = formData.get('name') as string
      value = parseFloat(formData.get('value') as string)
      description = formData.get('description') as string || null
      
      // Extract photos
      let index = 0
      while (formData.has(`photos[${index}]`)) {
        const photo = formData.get(`photos[${index}]`) as File
        if (photo && photo.size > 0) {
          photos.push(photo)
        }
        index++
      }
    }

    // Validate basic data
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 })
    }
    
    if (!value || value <= 0) {
      return NextResponse.json({ error: 'El valor debe ser mayor a 0' }, { status: 400 })
    }

    // Create guarantee in database first
    const guarantee = await prisma.guarantee.create({
      data: {
        name,
        value,
        description,
      },
    })

    // Handle photo uploads if any
    if (photos.length > 0) {
      // Create directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'guarantees', guarantee.id)
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
      }

      // Save each photo and create GuaranteePhoto records
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate unique filename
        const fileExtension = photo.name.split('.').pop() || 'jpg'
        const timestamp = Date.now()
        const filename = `photo_${timestamp}_${i + 1}.${fileExtension}`
        const filepath = join(uploadDir, filename)
        
        await writeFile(filepath, buffer)
        
        // Create GuaranteePhoto record
        await prisma.guaranteePhoto.create({
          data: {
            guaranteeId: guarantee.id,
            url: `/uploads/guarantees/${guarantee.id}/${filename}`,
            filename: filename,
            size: buffer.length,
            mimeType: photo.type,
          },
        })
      }
    }
    
    // Return updated guarantee with photos
    const updatedGuarantee = await prisma.guarantee.findUnique({
      where: { id: guarantee.id },
      include: {
        photos: true,
      },
    })
    
    return NextResponse.json(updatedGuarantee)
    
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
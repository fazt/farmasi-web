import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const guarantee = await prisma.guarantee.findUnique({
      where: { id },
      include: {
        photos: true,
        _count: {
          select: {
            loans: true,
            contracts: true,
          },
        },
      },
    })

    if (!guarantee) {
      return NextResponse.json({ error: 'Garantía no encontrada' }, { status: 404 })
    }

    return NextResponse.json(guarantee)
  } catch (error) {
    console.error('Error fetching guarantee:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, value, description } = body

    // Validate required fields
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 })
    }
    
    if (!value || value <= 0) {
      return NextResponse.json({ error: 'El valor debe ser mayor a 0' }, { status: 400 })
    }

    // Check if guarantee exists
    const existingGuarantee = await prisma.guarantee.findUnique({
      where: { id }
    })

    if (!existingGuarantee) {
      return NextResponse.json({ error: 'Garantía no encontrada' }, { status: 404 })
    }

    // Update guarantee
    const updatedGuarantee = await prisma.guarantee.update({
      where: { id },
      data: {
        name,
        value: Number(value),
        description: description || null,
      },
      include: {
        photos: true,
        _count: {
          select: {
            loans: true,
            contracts: true,
          },
        },
      },
    })

    return NextResponse.json(updatedGuarantee)
  } catch (error) {
    console.error('Error updating guarantee:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la garantía' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if guarantee exists
    const guarantee = await prisma.guarantee.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            loans: true,
            contracts: true,
          },
        },
      },
    })

    if (!guarantee) {
      return NextResponse.json({ error: 'Garantía no encontrada' }, { status: 404 })
    }

    // Check if guarantee is being used
    if (guarantee._count.loans > 0 || guarantee._count.contracts > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una garantía que está siendo utilizada' },
        { status: 400 }
      )
    }

    // Delete guarantee and its photos
    await prisma.$transaction(async (tx) => {
      // Delete photos first
      await tx.guaranteePhoto.deleteMany({
        where: { guaranteeId: id },
      })

      // Delete guarantee
      await tx.guarantee.delete({
        where: { id },
      })
    })

    return NextResponse.json({ message: 'Garantía eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting guarantee:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la garantía' },
      { status: 500 }
    )
  }
}
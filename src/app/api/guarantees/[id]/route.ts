import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { guaranteeSchema } from '@/lib/validations/guarantee'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const guarantee = await prisma.guarantee.findUnique({
      where: { id },
      include: {
        loans: {
          include: {
            client: true,
          },
        },
        contracts: {
          include: {
            client: true,
            loan: true,
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = guaranteeSchema.parse(body)

    const guarantee = await prisma.guarantee.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(guarantee)
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if guarantee is being used by any loans or contracts
    const [loansCount, contractsCount] = await Promise.all([
      prisma.loan.count({ where: { guaranteeId: id } }),
      prisma.contract.count({ where: { guaranteeId: id } })
    ])

    if (loansCount > 0 || contractsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una garantía que está siendo utilizada por préstamos o contratos' },
        { status: 400 }
      )
    }

    await prisma.guarantee.delete({
      where: { id },
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
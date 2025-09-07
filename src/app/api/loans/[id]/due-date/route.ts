import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateDueDateSchema = z.object({
  dueDate: z.string().transform((str) => new Date(str)),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateDueDateSchema.parse(body)

    // Verify loan exists and is active
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    if (loan.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: 'Solo se puede modificar la fecha de vencimiento de préstamos activos' 
      }, { status: 400 })
    }

    // Update the due date
    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        dueDate: validatedData.dueDate,
      },
      include: {
        client: true,
        interestRate: true,
        guarantee: true,
        payments: true,
        _count: {
          select: {
            payments: true,
          },
        },
      },
    })

    return NextResponse.json(updatedLoan)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Fecha inválida' },
        { status: 400 }
      )
    }

    console.error('Error updating loan due date:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la fecha de vencimiento' },
      { status: 500 }
    )
  }
}
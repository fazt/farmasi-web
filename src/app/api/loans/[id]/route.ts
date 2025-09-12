import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        client: true,
        interestRate: true,
        guarantee: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        contracts: true,
      },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error fetching loan:', error)
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
    const { status } = body

    // Only allow status changes for now
    if (!status || !['ACTIVE', 'PAID', 'OVERDUE', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const loan = await prisma.$transaction(async (tx) => {
      const updatedLoan = await tx.loan.update({
        where: { id },
        data: {
          status,
          completedAt: status === 'PAID' ? new Date() : null,
        },
        include: {
          client: true,
          interestRate: true,
          guarantee: true,
        },
      })

      // If loan is cancelled or paid, make guarantee available again
      if (status === 'CANCELLED' || status === 'PAID') {
        if (updatedLoan.guaranteeId) {
          await tx.guarantee.update({
            where: { id: updatedLoan.guaranteeId },
            data: { status: 'ACTIVE' },
          })
        }
      }

      return updatedLoan
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error updating loan:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el préstamo' },
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

    // Check if loan has payments
    const paymentsCount = await prisma.payment.count({
      where: { loanId: id },
    })

    if (paymentsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un préstamo que tiene pagos registrados' },
        { status: 400 }
      )
    }

    // Delete loan and restore guarantee status
    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id } })
      if (loan && loan.guaranteeId) {
        await tx.guarantee.update({
          where: { id: loan.guaranteeId },
          data: { status: 'ACTIVE' },
        })
      }

      await tx.loan.delete({ where: { id } })
    })

    return NextResponse.json({ message: 'Préstamo eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting loan:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el préstamo' },
      { status: 500 }
    )
  }
}
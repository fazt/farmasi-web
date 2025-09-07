import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        loan: {
          include: {
            client: true,
            interestRate: true,
            guarantee: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { loan: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    // Delete payment and update loan in transaction
    await prisma.$transaction(async (tx) => {
      // Delete the payment
      await tx.payment.delete({ where: { id } })

      // Recalculate loan amounts
      const loan = payment.loan
      const newPaidAmount = loan.paidAmount - payment.amount
      const newBalance = loan.totalAmount - newPaidAmount
      
      // Update loan status
      let newStatus = 'ACTIVE'
      let completedAt = null
      
      if (newBalance <= 0) {
        newStatus = 'PAID'
        completedAt = new Date()
      } else if (loan.status === 'PAID') {
        // If loan was previously paid but now has balance, make it active again
        newStatus = 'ACTIVE'
      }

      await tx.loan.update({
        where: { id: payment.loanId },
        data: {
          paidAmount: newPaidAmount,
          balance: Math.max(newBalance, 0),
          status: newStatus,
          completedAt,
        },
      })

      // Update guarantee status if needed
      if (newStatus === 'ACTIVE' && loan.status === 'PAID') {
        await tx.guarantee.update({
          where: { id: loan.guaranteeId },
          data: { status: 'USED' },
        })
      }
    })

    return NextResponse.json({ message: 'Pago eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el pago' },
      { status: 500 }
    )
  }
}
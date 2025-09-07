import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { interestRateSchema } from '@/lib/validations/interest-rate'

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
    const validatedData = interestRateSchema.parse(body)

    // Check if another interest rate with same loan amount exists
    const existingRate = await prisma.interestRate.findFirst({
      where: { 
        loanAmount: validatedData.loanAmount,
        isActive: true,
        id: { not: id },
      },
    })

    if (existingRate) {
      return NextResponse.json(
        { error: 'Ya existe otra tasa de interés para este monto' },
        { status: 400 }
      )
    }

    const interestRate = await prisma.interestRate.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(interestRate)
  } catch (error) {
    console.error('Error updating interest rate:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la tasa de interés' },
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

    // Check if interest rate is being used by any loans
    const loansCount = await prisma.loan.count({
      where: { interestRateId: id },
    })

    if (loansCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una tasa de interés que está siendo utilizada por préstamos' },
        { status: 400 }
      )
    }

    await prisma.interestRate.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tasa de interés eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting interest rate:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la tasa de interés' },
      { status: 500 }
    )
  }
}
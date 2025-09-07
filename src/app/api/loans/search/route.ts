import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const activeOnly = searchParams.get('activeOnly') === 'true'

    if (!search) {
      return NextResponse.json({ loans: [] })
    }

    const where: any = {
      OR: [
        { client: { firstName: { contains: search, mode: 'insensitive' as const } } },
        { client: { lastName: { contains: search, mode: 'insensitive' as const } } },
        { client: { email: { contains: search, mode: 'insensitive' as const } } },
        { client: { phone: { contains: search, mode: 'insensitive' as const } } },
        { client: { documentNumber: { contains: search, mode: 'insensitive' as const } } },
      ],
    }

    if (activeOnly) {
      where.status = 'ACTIVE'
    }

    const loans = await prisma.loan.findMany({
      where,
      take: 10, // Limit results for search
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        interestRate: true,
        guarantee: true,
      },
    })

    return NextResponse.json({ loans })
  } catch (error) {
    console.error('Error searching loans:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
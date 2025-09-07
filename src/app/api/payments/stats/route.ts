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

    // Get current date boundaries
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get week boundaries (Sunday to Saturday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    // Get all payments statistics
    const [
      totalStats,
      todayStats,
      weekStats,
    ] = await Promise.all([
      // Total payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      }),
      
      // Today's payments
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // This week's payments
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      total: {
        amount: totalStats._sum.amount || 0,
        count: totalStats._count.id || 0,
        average: totalStats._avg.amount || 0,
      },
      today: {
        amount: todayStats._sum.amount || 0,
        count: todayStats._count.id || 0,
      },
      week: {
        amount: weekStats._sum.amount || 0,
        count: weekStats._count.id || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching payments stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
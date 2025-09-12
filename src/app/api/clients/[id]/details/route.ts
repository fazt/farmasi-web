import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        loans: {
          include: {
            payments: {
              orderBy: {
                dueDate: 'asc'
              }
            },
            interestRate: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        guarantees: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        contracts: {
          include: {
            loan: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client details:', error)
    return NextResponse.json(
      { error: 'Error al obtener los detalles del cliente' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
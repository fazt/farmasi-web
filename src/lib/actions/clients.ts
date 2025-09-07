import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  documentType?: string | null
  documentNumber?: string | null
  createdAt: Date
  _count: {
    loans: number
  }
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ClientsResponse {
  clients: Client[]
  pagination: PaginationData
}

export async function getClients(
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<ClientsResponse> {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { documentNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            loans: true,
          },
        },
      },
    }),
    prisma.client.count({ where }),
  ])

  return {
    clients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}
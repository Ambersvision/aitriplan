import { prisma } from '@/lib/prisma'
import { TripStatus } from '@prisma/client'

export interface CreateTripInput {
  title: string
  description?: string
  startDate: Date
  endDate: Date
  userId: string
}

export interface UpdateTripInput {
  title?: string
  description?: string
  startDate?: Date
  endDate?: Date
  status?: TripStatus
}

export async function createTrip(data: CreateTripInput) {
  return prisma.trip.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      userId: data.userId
    }
  })
}

export async function getTripsByUser(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { destinations: true, items: true }
      }
    }
  })
}

export async function getTripById(id: string, userId: string) {
  return prisma.trip.findFirst({
    where: { id, userId },
    include: {
      destinations: {
        orderBy: { order: 'asc' }
      },
      items: {
        orderBy: [{ order: 'asc' }, { startTime: 'asc' }]
      }
    }
  })
}

export async function updateTrip(id: string, userId: string, data: UpdateTripInput) {
  return prisma.trip.updateMany({
    where: { id, userId },
    data
  })
}

export async function deleteTrip(id: string, userId: string) {
  return prisma.trip.deleteMany({
    where: { id, userId }
  })
}

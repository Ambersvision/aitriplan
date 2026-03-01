import { prisma } from '@/lib/prisma'

export interface CreateCheckInInput {
  userId: string
  tripId: string
  latitude: number
  longitude: number
  address?: string
  content: string
  photos?: string[]
  videos?: string[]
  tags?: string[]
}

export async function createCheckIn(data: CreateCheckInInput) {
  return prisma.checkIn.create({
    data: {
      userId: data.userId,
      tripId: data.tripId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      content: data.content,
      photos: data.photos || [],
      videos: data.videos || [],
      tags: data.tags || []
    }
  })
}

export async function getCheckInsByTrip(tripId: string, userId: string) {
  return prisma.checkIn.findMany({
    where: { tripId, userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { comments: true }
      }
    }
  })
}

export async function getCheckInById(id: string, userId: string) {
  return prisma.checkIn.findFirst({
    where: { id, userId },
    include: {
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { name: true, image: true }
          }
        }
      }
    }
  })
}

export async function deleteCheckIn(id: string, userId: string) {
  return prisma.checkIn.deleteMany({
    where: { id, userId }
  })
}

export async function incrementLikes(id: string) {
  return prisma.checkIn.update({
    where: { id },
    data: {
      likes: {
        increment: 1
      }
    }
  })
}

import { createTrip, getTripById, updateTrip, deleteTrip, getTripsByUser } from '@/lib/services/trip.service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    trip: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn()
    }
  }
}))

describe('Trip Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTrip', () => {
    it('should create a trip with valid data', async () => {
      const tripData = {
        title: 'Japan Trip',
        description: 'Tokyo and Kyoto',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        userId: 'user-123'
      }

      const mockTrip = { id: 'trip-123', ...tripData, status: 'PLANNING' }
      ;(prisma.trip.create as jest.Mock).mockResolvedValue(mockTrip)

      const result = await createTrip(tripData)

      expect(result).toEqual(mockTrip)
      expect(prisma.trip.create).toHaveBeenCalledWith({
        data: tripData
      })
    })
  })

  describe('getTripsByUser', () => {
    it('should return trips for a user', async () => {
      const mockTrips = [
        { id: '1', title: 'Trip 1', userId: 'user-123' },
        { id: '2', title: 'Trip 2', userId: 'user-123' }
      ]

      ;(prisma.trip.findMany as jest.Mock).mockResolvedValue(mockTrips)

      const result = await getTripsByUser('user-123')

      expect(result).toEqual(mockTrips)
      expect(prisma.trip.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { destinations: true, items: true }
          }
        }
      })
    })
  })

  describe('getTripById', () => {
    it('should return a trip by id', async () => {
      const mockTrip = {
        id: 'trip-123',
        title: 'Japan Trip',
        userId: 'user-123',
        destinations: [],
        items: []
      }

      ;(prisma.trip.findFirst as jest.Mock).mockResolvedValue(mockTrip)

      const result = await getTripById('trip-123', 'user-123')

      expect(result).toEqual(mockTrip)
      expect(prisma.trip.findFirst).toHaveBeenCalledWith({
        where: { id: 'trip-123', userId: 'user-123' },
        include: {
          destinations: { orderBy: { order: 'asc' } },
          items: { orderBy: [{ order: 'asc' }, { startTime: 'asc' }] }
        }
      })
    })

    it('should return null if trip not found', async () => {
      ;(prisma.trip.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await getTripById('non-existent', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('updateTrip', () => {
    it('should update a trip', async () => {
      const updateData = { title: 'Updated Trip' }
      ;(prisma.trip.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

      const result = await updateTrip('trip-123', 'user-123', updateData)

      expect(result.count).toBe(1)
      expect(prisma.trip.updateMany).toHaveBeenCalledWith({
        where: { id: 'trip-123', userId: 'user-123' },
        data: updateData
      })
    })
  })

  describe('deleteTrip', () => {
    it('should delete a trip', async () => {
      ;(prisma.trip.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })

      const result = await deleteTrip('trip-123', 'user-123')

      expect(result.count).toBe(1)
      expect(prisma.trip.deleteMany).toHaveBeenCalledWith({
        where: { id: 'trip-123', userId: 'user-123' }
      })
    })
  })
})

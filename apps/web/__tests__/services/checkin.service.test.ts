import { createCheckIn, getCheckInsByTrip, getCheckInById, deleteCheckIn } from '@/lib/services/checkin.service'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    checkIn: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn()
    }
  }
}))

describe('CheckIn Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCheckIn', () => {
    it('should create a check-in', async () => {
      const checkInData = {
        userId: 'user-123',
        tripId: 'trip-123',
        latitude: 35.6,
        longitude: 139.7,
        address: 'Tokyo, Japan',
        content: 'Amazing view!',
        photos: ['photo1.jpg'],
        videos: [],
        tags: ['sightseeing']
      }

      const mockCheckIn = { id: 'checkin-123', ...checkInData, likes: 0 }
      ;(prisma.checkIn.create as jest.Mock).mockResolvedValue(mockCheckIn)

      const result = await createCheckIn(checkInData)

      expect(result).toEqual(mockCheckIn)
      expect(prisma.checkIn.create).toHaveBeenCalledWith({
        data: checkInData
      })
    })
  })

  describe('getCheckInsByTrip', () => {
    it('should return check-ins for a trip', async () => {
      const mockCheckIns = [
        { id: '1', tripId: 'trip-123', content: 'First stop' },
        { id: '2', tripId: 'trip-123', content: 'Second stop' }
      ]

      ;(prisma.checkIn.findMany as jest.Mock).mockResolvedValue(mockCheckIns)

      const result = await getCheckInsByTrip('trip-123', 'user-123')

      expect(result).toEqual(mockCheckIns)
      expect(prisma.checkIn.findMany).toHaveBeenCalledWith({
        where: { tripId: 'trip-123', userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { comments: true } }
        }
      })
    })
  })

  describe('getCheckInById', () => {
    it('should return a check-in with comments', async () => {
      const mockCheckIn = {
        id: 'checkin-123',
        content: 'Great place!',
        comments: [
          { id: 'c1', content: 'Nice photo!' },
          { id: 'c2', content: 'Thanks!' }
        ]
      }

      ;(prisma.checkIn.findFirst as jest.Mock).mockResolvedValue(mockCheckIn)

      const result = await getCheckInById('checkin-123', 'user-123')

      expect(result).toEqual(mockCheckIn)
    })
  })

  describe('deleteCheckIn', () => {
    it('should delete a check-in', async () => {
      ;(prisma.checkIn.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })

      const result = await deleteCheckIn('checkin-123', 'user-123')

      expect(result.count).toBe(1)
    })
  })
})

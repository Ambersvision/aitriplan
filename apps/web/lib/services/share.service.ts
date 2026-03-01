import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function createShareLink(checkInId: string, expiresInDays?: number) {
  const token = crypto.randomBytes(32).toString('hex')
  
  return prisma.shareLink.create({
    data: {
      checkInId,
      token,
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null
    }
  })
}

export async function getShareByToken(token: string) {
  const share = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      checkIn: {
        include: {
          trip: {
            select: { title: true }
          },
          user: {
            select: { name: true, image: true }
          },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        }
      }
    }
  })

  if (!share || !share.isActive) {
    return null
  }

  if (share.expiresAt && new Date() > share.expiresAt) {
    return null
  }

  await prisma.shareLink.update({
    where: { id: share.id },
    data: { views: { increment: 1 } }
  })

  return share
}

export async function createComment(
  checkInId: string,
  content: string,
  userId?: string,
  userName?: string
) {
  return prisma.comment.create({
    data: {
      checkInId,
      userId,
      userName: userName || (userId ? undefined : '匿名用户'),
      content
    }
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createShareLink } from '@/lib/services/share.service'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { checkInId, expiresInDays } = body

    if (!checkInId) {
      return NextResponse.json({ error: 'CheckIn ID required' }, { status: 400 })
    }

    const share = await createShareLink(checkInId, expiresInDays)
    
    return NextResponse.json({
      token: share.token,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${share.token}`
    })
  } catch {
    console.error('Create share error:', error)
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}

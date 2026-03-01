import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createCheckIn, getCheckInsByTrip } from '@/lib/services/checkin.service'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tripId = searchParams.get('tripId')

  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID required' }, { status: 400 })
  }

  try {
    const checkIns = await getCheckInsByTrip(tripId, session.user.id)
    return NextResponse.json(checkIns)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    const checkIn = await createCheckIn({
      userId: session.user.id,
      tripId: body.tripId,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address,
      content: body.content,
      photos: body.photos,
      videos: body.videos,
      tags: body.tags
    })

    return NextResponse.json(checkIn, { status: 201 })
  } catch (error) {
    console.error('Create check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to create check-in' },
      { status: 500 }
    )
  }
}

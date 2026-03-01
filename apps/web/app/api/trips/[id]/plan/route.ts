import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateTripPlanWithAI } from '@/lib/services/ai-trip.service'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const result = await generateTripPlanWithAI(
      params.id,
      session.user.id,
      {
        destinations: body.destinations,
        startDate: body.startDate,
        endDate: body.endDate,
        preferences: body.preferences
      }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI planning error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate plan' },
      { status: 500 }
    )
  }
}

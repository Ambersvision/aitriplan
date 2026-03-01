import { NextRequest, NextResponse } from 'next/server'
import { MapService } from '@/lib/map/factory'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  try {
    const location = await MapService.geocode(address)
    return NextResponse.json({ location })
  } catch {
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    )
  }
}

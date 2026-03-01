import { NextRequest, NextResponse } from 'next/server'
import { MapService } from '@/lib/map/factory'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword required' }, { status: 400 })
  }

  const location = lat && lng ? {
    latitude: parseFloat(lat),
    longitude: parseFloat(lng)
  } : undefined

  try {
    const pois = await MapService.searchPOI(keyword, location)
    return NextResponse.json({ pois })
  } catch {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

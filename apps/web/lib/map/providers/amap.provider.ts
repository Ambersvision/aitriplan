import { MapProvider, GeoLocation, Address, POI, Route, TransportMode } from '../types'

interface AMapPOIItem {
  id: string
  name: string
  address?: string
  location?: string
  type: string
  distance?: string
}

interface AMapRouteStep {
  instruction: string
  distance: string
  duration: string
  start_location: string
  end_location: string
}

export class AMapProvider implements MapProvider {
  name = 'amap'
  private apiKey: string

  constructor() {
    this.apiKey = process.env.AMAP_KEY || ''
    if (!this.apiKey) {
      throw new Error('AMAP_KEY not configured')
    }
  }

  async geocode(address: string): Promise<GeoLocation | null> {
    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${this.apiKey}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.geocodes?.length > 0) {
        const location = data.geocodes[0].location.split(',')
        return {
          latitude: parseFloat(location[1]),
          longitude: parseFloat(location[0])
        }
      }
      return null
    } catch {
      console.error('AMap geocode error:', error)
      return null
    }
  }

  async reverseGeocode(location: GeoLocation): Promise<Address | null> {
    const url = `https://restapi.amap.com/v3/geocode/regeo?location=${location.longitude},${location.latitude}&key=${this.apiKey}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.regeocode) {
        const address = data.regeocode.addressComponent
        return {
          formatted: data.regeocode.formatted_address,
          province: address.province,
          city: address.city,
          district: address.district,
          street: address.street,
          streetNumber: address.streetNumber
        }
      }
      return null
    } catch {
      console.error('AMap reverse geocode error:', error)
      return null
    }
  }

  async searchPOI(
    keyword: string,
    location?: GeoLocation,
    radius: number = 5000
  ): Promise<POI[]> {
    let url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&key=${this.apiKey}&offset=20&page=1`
    
    if (location) {
      url += `&location=${location.longitude},${location.latitude}&radius=${radius}`
    }

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.pois) {
        return data.pois.map((poi: AMapPOIItem) => {
          const loc = poi.location?.split(',')
          return {
            id: poi.id,
            name: poi.name,
            address: poi.address || '',
            location: loc ? {
              latitude: parseFloat(loc[1]),
              longitude: parseFloat(loc[0])
            } : { latitude: 0, longitude: 0 },
            type: poi.type,
            distance: poi.distance ? parseInt(poi.distance) : undefined
          }
        })
      }
      return []
    } catch {
      console.error('AMap POI search error:', error)
      return []
    }
  }

  async getRoute(
    from: GeoLocation,
    to: GeoLocation,
    mode: TransportMode = 'driving'
  ): Promise<Route | null> {
    const origin = `${from.longitude},${from.latitude}`
    const destination = `${to.longitude},${to.latitude}`
    
    let url: string
    switch (mode) {
      case 'walking':
        url = `https://restapi.amap.com/v3/direction/walking?origin=${origin}&destination=${destination}&key=${this.apiKey}`
        break
      case 'transit':
        url = `https://restapi.amap.com/v3/direction/transit/integrated?origin=${origin}&destination=${destination}&key=${this.apiKey}&city=北京`
        break
      case 'bicycling':
        url = `https://restapi.amap.com/v3/direction/riding?origin=${origin}&destination=${destination}&key=${this.apiKey}`
        break
      default:
        url = `https://restapi.amap.com/v3/direction/driving?origin=${origin}&destination=${destination}&key=${this.apiKey}`
    }

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.route?.paths?.length > 0) {
        const path = data.route.paths[0]
        return {
          distance: parseInt(path.distance),
          duration: parseInt(path.duration),
          steps: path.steps?.map((step: AMapRouteStep) => ({
            instruction: step.instruction,
            distance: parseInt(step.distance),
            duration: parseInt(step.duration),
            startLocation: this.parseLocation(step.start_location),
            endLocation: this.parseLocation(step.end_location)
          })) || [],
          polyline: []
        }
      }
      return null
    } catch {
      console.error('AMap route error:', error)
      return null
    }
  }

  private parseLocation(loc: string): GeoLocation {
    const [lng, lat] = loc.split(',').map(Number)
    return { longitude: lng, latitude: lat }
  }
}

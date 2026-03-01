export interface GeoLocation {
  latitude: number
  longitude: number
}

export interface Address {
  formatted: string
  province?: string
  city?: string
  district?: string
  street?: string
  streetNumber?: string
}

export interface POI {
  id: string
  name: string
  address: string
  location: GeoLocation
  type: string
  distance?: number
}

export interface Route {
  distance: number // meters
  duration: number // seconds
  steps: RouteStep[]
  polyline: GeoLocation[]
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  startLocation: GeoLocation
  endLocation: GeoLocation
}

export type TransportMode = 'driving' | 'walking' | 'transit' | 'bicycling'

export interface MapProvider {
  name: string
  geocode(address: string): Promise<GeoLocation | null>
  reverseGeocode(location: GeoLocation): Promise<Address | null>
  searchPOI(keyword: string, location?: GeoLocation, radius?: number): Promise<POI[]>
  getRoute(from: GeoLocation, to: GeoLocation, mode: TransportMode): Promise<Route | null>
}

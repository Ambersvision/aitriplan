import { MapProvider, GeoLocation, Address, POI, Route, TransportMode } from '../types'

interface AMapGeocodeResponse {
  status: string
  geocodes?: Array<{
    location: string
  }>
}

interface AMapRegeocodeResponse {
  status: string
  regeocode?: {
    formatted_address: string
    addressComponent: {
      province: string
      city: string
      district: string
      street: string
      streetNumber: string
    }
  }
}

interface AMapPOIItem {
  id: string
  name: string
  address?: string
  location?: string
  type: string
  distance?: string
}

interface AMapPOIResponse {
  status: string
  pois?: AMapPOIItem[]
}

interface AMapRouteStep {
  instruction: string
  distance: string
  duration: string
  start_location: string
  end_location: string
}

interface AMapRoutePath {
  distance: string
  duration: string
  steps?: AMapRouteStep[]
}

interface AMapRouteResponse {
  status: string
  route?: {
    paths?: AMapRoutePath[]
  }
}
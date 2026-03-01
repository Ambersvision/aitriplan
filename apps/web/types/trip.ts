import { Location } from './location'
import { ItemType, TransportMode } from '@prisma/client'

export interface TripCreateInput {
  title: string
  description?: string
  startDate: Date
  endDate: Date
}

export interface DestinationInput {
  name: string
  order: number
  latitude: number
  longitude: number
  address?: string
}

export interface ItineraryItemInput {
  type: ItemType
  title: string
  description?: string
  startTime: Date
  endTime: Date
  fromLocation?: Location
  toLocation?: Location
  transportMode?: TransportMode
  transportCost?: number
  ticketCost?: number
  otherCost?: number
}

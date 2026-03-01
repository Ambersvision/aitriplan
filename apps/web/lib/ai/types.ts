export interface Location {
  name: string
  address?: string
  latitude: number
  longitude: number
}

export interface AIItineraryItem {
  type: 'TRANSPORT' | 'ATTRACTION' | 'FOOD' | 'ACCOMMODATION' | 'ACTIVITY'
  title: string
  description?: string
  startTime: string // ISO string
  endTime: string
  duration: number // minutes
  fromLocation?: Location
  toLocation?: Location
  transportMode?: string
  transportCost?: number
  ticketCost?: number
  otherCost?: number
}

export interface AITripPlan {
  destinations: {
    name: string
    order: number
    latitude: number
    longitude: number
    address?: string
  }[]
  items: AIItineraryItem[]
  totalCost: number
  tips: string[]
}

export interface TripPlanParams {
  destinations: string[]
  startDate: string
  endDate: string
  preferences?: {
    transportPreference?: string
    pace?: 'relaxed' | 'moderate' | 'intensive'
    budget?: 'budget' | 'moderate' | 'luxury'
    specialNeeds?: string[]
  }
}

export interface FoodRecommendation {
  name: string
  type: string
  specialty: string
  priceRange: string
  bestTime: string
  tips: string
}

export interface AIProvider {
  generateTripPlan(params: TripPlanParams): Promise<AITripPlan>
  generateFoodRecommendations(location: Location, count?: number): Promise<FoodRecommendation[]>
  streamResponse(prompt: string): AsyncIterable<string>
}

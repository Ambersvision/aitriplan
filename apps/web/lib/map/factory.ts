import { AMapProvider } from './providers/amap.provider'
import { MapProvider, GeoLocation } from './types'

export class MapService {
  private static providers: Map<string, MapProvider> = new Map()

  static getProvider(location?: GeoLocation): MapProvider {
    if (!this.providers.has('amap')) {
      this.providers.set('amap', new AMapProvider())
    }
    return this.providers.get('amap')!
  }

  static async geocode(address: string): Promise<GeoLocation | null> {
    return this.getProvider().geocode(address)
  }

  static async searchPOI(keyword: string, location?: GeoLocation) {
    return this.getProvider().searchPOI(keyword, location)
  }
}

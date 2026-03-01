import { KimiProvider } from './providers/kimi.provider'
import { AIProvider } from './types'

export type AIProviderType = 'kimi' | 'deepseek' | 'glm' | 'oneapi'

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map()

  static getProvider(type?: AIProviderType): AIProvider {
    const providerType = type || (process.env.DEFAULT_AI_PROVIDER as AIProviderType) || 'kimi'

    if (!this.providers.has(providerType)) {
      switch (providerType) {
        case 'kimi':
          this.providers.set(providerType, new KimiProvider())
          break
        default:
          throw new Error(`Unknown AI provider: ${providerType}`)
      }
    }

    return this.providers.get(providerType)!
  }

  static getProviderWithFallback(): AIProvider[] {
    const providers: AIProvider[] = []
    
    const types: AIProviderType[] = ['kimi', 'deepseek', 'glm']
    
    for (const type of types) {
      try {
        providers.push(this.getProvider(type))
      } catch {
        console.warn(`Failed to initialize ${type} provider`)
      }
    }

    if (providers.length === 0) {
      throw new Error('No AI providers available')
    }

    return providers
  }
}

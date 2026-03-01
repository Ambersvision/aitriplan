import OpenAI from 'openai'
import { AIProvider, TripPlanParams, AITripPlan, Location, FoodRecommendation } from '../types'
import { generateTripPlanPrompt } from '../prompts/trip.prompt'

export class KimiProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.KIMI_API_KEY,
      baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1'
    })
  }

  async generateTripPlan(params: TripPlanParams): Promise<AITripPlan> {
    const prompt = generateTripPlanPrompt(params)

    const response = await this.client.chat.completions.create({
      model: 'moonshot-v1-128k',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的旅行规划师，擅长制定详细的旅行行程。请严格按照用户要求输出JSON格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from Kimi')
    }

    try {
      const plan = JSON.parse(content) as AITripPlan
      return plan
    } catch {
      throw new Error('Failed to parse AI response')
    }
  }

  async generateFoodRecommendations(
    location: Location,
    count: number = 5
  ): Promise<FoodRecommendation[]> {
    const prompt = `请为以下位置推荐${count}个当地特色美食和餐厅：

位置：${location.name}
坐标：${location.latitude}, ${location.longitude}

请以JSON数组格式返回，每个元素包含：
- name: 餐厅/美食名称
- type: 类型（如：火锅、小吃、正餐等）
- specialty: 招牌菜/特色
- priceRange: 人均消费范围（如：50-100元）
- bestTime: 推荐用餐时间
- tips: 用餐建议

注意：请确保推荐真实存在的餐厅类型。`

    const response = await this.client.chat.completions.create({
      model: 'moonshot-v1-128k',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) return []

    try {
      const result = JSON.parse(content)
      return result.recommendations || []
    } catch {
      return []
    }
  }

  async *streamResponse(prompt: string): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: 'moonshot-v1-128k',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      stream: true
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
}

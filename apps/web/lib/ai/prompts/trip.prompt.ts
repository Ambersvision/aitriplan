import { TripPlanParams } from '../types'

export function generateTripPlanPrompt(params: TripPlanParams): string {
  const { destinations, startDate, endDate, preferences } = params

  return `你是一位专业的旅行规划师。请根据以下信息生成详细的旅行规划：

【目的地】
${destinations.map((d, i) => `${i + 1}. ${d}`).join('\n')}

【时间】
开始：${startDate}
结束：${endDate}

【偏好】
- 交通方式偏好：${preferences?.transportPreference || '无特殊偏好'}
- 游玩节奏：${preferences?.pace || '适中'} (relaxed=休闲, moderate=适中, intensive=紧凑)
- 预算等级：${preferences?.budget || 'moderate'} (budget=经济, moderate=中等, luxury=豪华)
- 特殊需求：${preferences?.specialNeeds?.join(', ') || '无'}

【要求】
1. 精确到每个行程项的开始和结束时间（精确到分钟，格式：YYYY-MM-DDTHH:mm:ss）
2. 包含交通时间、游览时间、用餐时间、休息时间
3. 每个景点提供游览建议（最佳时间、必看内容、注意事项）
4. 推荐当地特色美食（餐厅类型、人均价格、招牌菜）
5. 计算每个行程项的预估费用（交通费、门票费、其他费用）
6. 考虑地理位置合理性，避免绕路，优化路线
7. 第一天和最后一天的交通安排要合理

【输出格式】
请以JSON格式返回：
{
  "destinations": [
    {
      "name": "城市名",
      "order": 0,
      "latitude": 纬度,
      "longitude": 经度,
      "address": "详细地址"
    }
  ],
  "items": [
    {
      "type": "TRANSPORT|ATTRACTION|FOOD|ACCOMMODATION|ACTIVITY",
      "title": "标题",
      "description": "详细描述和建议",
      "startTime": "2024-01-01T09:00:00",
      "endTime": "2024-01-01T11:00:00",
      "duration": 120,
      "fromLocation": {"name": "出发地", "latitude": 0, "longitude": 0},
      "toLocation": {"name": "目的地", "latitude": 0, "longitude": 0},
      "transportMode": "PLANE|TRAIN|BUS|TAXI|WALK|DRIVE|SHIP",
      "transportCost": 100,
      "ticketCost": 50,
      "otherCost": 20
    }
  ],
  "totalCost": 5000,
  "tips": ["提示1", "提示2"]
}

请确保JSON格式正确，所有字段都存在。`
}

import { prisma } from '@/lib/prisma'
import { AIProviderFactory } from '@/lib/ai/factory'
import { TripPlanParams } from '@/lib/ai/types'

export async function generateTripPlanWithAI(
  tripId: string,
  userId: string,
  params: TripPlanParams
) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId }
  })

  if (!trip) {
    throw new Error('Trip not found')
  }

  const provider = AIProviderFactory.getProvider()
  const plan = await provider.generateTripPlan(params)

  return prisma.$transaction(async (tx) => {
    await tx.destination.deleteMany({ where: { tripId } })
    await tx.itineraryItem.deleteMany({ where: { tripId } })

    const destinations = await Promise.all(
      plan.destinations.map((dest) =>
        tx.destination.create({
          data: {
            tripId,
            name: dest.name,
            order: dest.order,
            latitude: dest.latitude,
            longitude: dest.longitude,
            address: dest.address
          }
        })
      )
    )

    const items = await Promise.all(
      plan.items.map((item, index) =>
        tx.itineraryItem.create({
          data: {
            tripId,
            type: item.type,
            title: item.title,
            description: item.description,
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime),
            duration: item.duration,
            fromLocation: item.fromLocation,
            toLocation: item.toLocation,
            transportMode: item.transportMode as any,
            transportCost: item.transportCost,
            ticketCost: item.ticketCost,
            otherCost: item.otherCost,
            order: index,
            isAiGenerated: true
          }
        })
      )
    )

    return {
      trip: await tx.trip.update({
        where: { id: tripId },
        data: { status: 'PLANNING' }
      }),
      destinations,
      items,
      totalCost: plan.totalCost,
      tips: plan.tips
    }
  })
}

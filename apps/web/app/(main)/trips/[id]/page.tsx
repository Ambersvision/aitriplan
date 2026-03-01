import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getTripById } from '@/lib/services/trip.service'
import Link from 'next/link'
import AIPlanButton from '@/components/trip/AIPlanButton'

interface TripDetailPageProps {
  params: { id: string }
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const trip = await getTripById(params.id, session.user.id)

  if (!trip) {
    redirect('/trips')
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link href="/trips" className="text-blue-600 hover:underline">
            ← 返回列表
          </Link>
          <h1 className="text-3xl font-bold mt-4">{trip.title}</h1>
          <p className="text-gray-600 mt-2">{trip.description}</p>
          <p className="text-gray-500 mt-1">
            {new Date(trip.startDate).toLocaleDateString('zh-CN')} - {' '}
            {new Date(trip.endDate).toLocaleDateString('zh-CN')}
          </p>
        </div>
        <AIPlanButton tripId={trip.id} />
      </div>

      {trip.destinations.length === 0 && trip.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">还没有行程规划</p>
          <p className="text-gray-400 mb-6">点击右上角按钮使用 AI 生成行程</p>
        </div>
      ) : (
        <div className="space-y-6">
          {trip.destinations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">目的地</h2>
              <div className="space-y-2">
                {trip.destinations.map((dest, index) => (
                  <div
                    key={dest.id}
                    className="flex items-center p-3 bg-gray-50 rounded"
                  >
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{dest.name}</p>
                      {dest.address && (
                        <p className="text-sm text-gray-500">{dest.address}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trip.items.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">行程安排</h2>
              <div className="space-y-4">
                {trip.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      item.type === 'TRANSPORT'
                        ? 'bg-orange-50 border-orange-400'
                        : item.type === 'FOOD'
                        ? 'bg-green-50 border-green-400'
                        : item.type === 'ACCOMMODATION'
                        ? 'bg-purple-50 border-purple-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(item.startTime).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {' - '}
                        {new Date(item.endTime).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {item.isAiGenerated && (
                      <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        AI 生成
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

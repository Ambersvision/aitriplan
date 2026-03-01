import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getTripsByUser } from '@/lib/services/trip.service'
import Link from 'next/link'

export default async function TripsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const trips = await getTripsByUser(session.user.id)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的旅行</h1>
        <Link
          href="/trips/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          创建新旅行
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">还没有旅行计划</p>
          <p className="text-gray-400 mt-2">点击上方按钮创建你的第一个旅行</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{trip.title}</h2>
              <p className="text-gray-600 mb-4">{trip.description || '暂无描述'}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {new Date(trip.startDate).toLocaleDateString('zh-CN')} - {' '}
                  {new Date(trip.endDate).toLocaleDateString('zh-CN')}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  trip.status === 'ONGOING'
                    ? 'bg-green-100 text-green-800'
                    : trip.status === 'COMPLETED'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {trip.status === 'ONGOING'
                    ? '进行中'
                    : trip.status === 'COMPLETED'
                    ? '已完成'
                    : trip.status === 'PLANNING'
                    ? '规划中'
                    : '已取消'}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                <span>{trip._count.destinations} 目的地</span>
                {' · '}
                <span>{trip._count.items} 行程项</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { notFound } from 'next/navigation'
import { getShareByToken } from '@/lib/services/share.service'

interface SharePageProps {
  params: { token: string }
}

export default async function SharePage({ params }: SharePageProps) {
  const share = await getShareByToken(params.token)

  if (!share) {
    notFound()
  }

  const checkIn = share.checkIn

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {checkIn.photos.length > 0 && (
            <div className="aspect-video bg-gray-200">
              <img
                src={checkIn.photos[0]}
                alt="Check-in photo"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                {(checkIn.user?.name || 'U')[0]}
              </div>
              <div className="ml-3">
                <p className="font-medium">{checkIn.user?.name || '匿名用户'}</p>
                <p className="text-sm text-gray-500">
                  {new Date(checkIn.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>

            <p className="text-gray-800 mb-4 whitespace-pre-wrap">{checkIn.content}</p>

            {checkIn.address && (
              <p className="text-sm text-gray-500 mb-4">📍 {checkIn.address}</p>
            )}

            {checkIn.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {checkIn.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center text-gray-500 text-sm">
              <span>❤️ {checkIn.likes} 赞</span>
              <span className="mx-2">·</span>
              <span>💬 {checkIn.comments.length} 评论</span>
              <span className="mx-2">·</span>
              <span>👁️ {share.views} 浏览</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">评论 ({checkIn.comments.length})</h2>
          
          {checkIn.comments.length === 0 ? (
            <p className="text-gray-500">暂无评论</p>
          ) : (
            <div className="space-y-4">
              {checkIn.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <span className="font-medium">
                      {comment.user?.name || comment.userName}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

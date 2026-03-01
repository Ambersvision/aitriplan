'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CreateCheckInPage() {
  const [content, setContent] = useState('')
  const [location, setLocation] = useState<{lat: number; lng: number; address?: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripId = searchParams.get('tripId')

  useEffect(() => {
    if (!tripId) {
      router.push('/trips')
    }
  }, [tripId, router])

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            const res = await fetch(`/api/map/geocode?address=${latitude},${longitude}`)
            const data = await res.json()
            
            setLocation({
              lat: latitude,
              lng: longitude,
              address: data.location?.address
            })
          } catch {
            setLocation({ lat: latitude, lng: longitude })
          }
          setGettingLocation(false)
        },
        () => {
          setError('无法获取位置信息')
          setGettingLocation(false)
        }
      )
    } else {
      setError('浏览器不支持地理定位')
      setGettingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location || !tripId) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          content
        })
      })

      if (!res.ok) throw new Error('打卡失败')

      router.push(`/trips/${tripId}`)
    } catch (err) {
      setError('打卡失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!tripId) return null

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">📍 位置打卡</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>
        )}

        {!location ? (
          <div className="text-center py-8">
            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {gettingLocation ? '定位中...' : '📍 获取当前位置'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">📍 当前位置</p>
              {location.address ? (
                <p className="text-gray-600">{location.address}</p>
              ) : (
                <p className="text-gray-500">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">打卡内容 *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="记录此刻..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/trips/${tripId}`)}
                className="px-4 py-2 text-gray-600"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '提交中...' : '打卡'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

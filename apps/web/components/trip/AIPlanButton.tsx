'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AIPlanButtonProps {
  tripId: string
}

export default function AIPlanButton({ tripId }: AIPlanButtonProps) {
  const [loading, setLoading] = useState(false)
  const [destinations, setDestinations] = useState('')
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!destinations.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: destinations.split('\n').filter(d => d.trim()),
          preferences: {
            pace: 'moderate'
          }
        })
      })

      if (!res.ok) {
        throw new Error('生成失败')
      }

      router.refresh()
      setShowForm(false)
    } catch (err) {
      alert('生成行程失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (showForm) {
    return (
      <div className="bg-white rounded-lg shadow p-6 w-96">
        <h3 className="font-semibold mb-4">AI 生成行程</h3>
        <textarea
          value={destinations}
          onChange={(e) => setDestinations(e.target.value)}
          placeholder="输入目的地（每行一个）&#10;例如：&#10;东京&#10;京都&#10;大阪"
          className="w-full px-3 py-2 border rounded-md mb-4"
          rows={5}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowForm(false)}
            className="px-3 py-1 text-gray-600"
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !destinations.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '生成中...' : '生成'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
    >
      ✨ AI 规划行程
    </button>
  )
}

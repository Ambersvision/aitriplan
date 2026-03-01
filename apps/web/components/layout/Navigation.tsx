'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface NavigationProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function Navigation({ user }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/trips" className="text-xl font-bold text-blue-600">
              AITriplan
            </Link>
            <div className="ml-10 flex space-x-4">
              <Link
                href="/trips"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                我的旅行
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user.name || user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

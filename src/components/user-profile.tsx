'use client'

import { useAuth } from '../contexts/auth-context'
import { useState } from 'react'
import Image from 'next/image'

export default function UserProfile() {
  const { user, logout, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {user.name || 'User'}
          </p>
          <p className="text-xs text-gray-500">
            {user.email}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  )
}

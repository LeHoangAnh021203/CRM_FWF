"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"

export function NavigationDebugger() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [clickCount, setClickCount] = useState(0)

  useEffect(() => {
    console.log('[NavigationDebugger] Pathname changed:', pathname)
    setNavigationHistory(prev => [...prev, `${new Date().toLocaleTimeString()}: ${pathname}`])
  }, [pathname])

  useEffect(() => {
    console.log('[NavigationDebugger] Auth state:', { isAuthenticated, user: user?.username, isLoading })
  }, [isAuthenticated, user, isLoading])

  const testNavigation = (path: string) => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    console.log(`[NavigationDebugger] Test navigation #${newCount} to:`, path)
    console.log('[NavigationDebugger] Current auth state:', { isAuthenticated, user: user?.username })
    router.push(path)
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Navigation Debug</h4>
      <div className="space-y-1">
        <p>Current: {pathname}</p>
        <p>Auth: {isAuthenticated ? '✅' : '❌'}</p>
        <p>User: {user?.username || 'None'}</p>
        <p>Loading: {isLoading ? '⏳' : '✅'}</p>
        <p>Clicks: {clickCount}</p>
      </div>
      
      <div className="mt-2 space-x-2">
        <button 
          onClick={() => testNavigation('/dashboard/customers')}
          className="bg-blue-500 px-2 py-1 rounded text-xs"
        >
          Customers
        </button>
        <button 
          onClick={() => testNavigation('/dashboard/orders')}
          className="bg-green-500 px-2 py-1 rounded text-xs"
        >
          Orders
        </button>
      </div>

      <div className="mt-2 max-h-32 overflow-y-auto text-xs">
        <p className="font-bold">History:</p>
        {navigationHistory.slice(-5).map((entry, index) => (
          <div key={index} className="text-gray-300">{entry}</div>
        ))}
      </div>
    </div>
  )
}

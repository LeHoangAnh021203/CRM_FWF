"use client"

import { useState, useEffect } from "react"
import { MockAuthService } from "@/lib/mock-auth"
import { Button } from "@/components/ui/button"

export function MockAuthToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [showAccounts, setShowAccounts] = useState(false)

  useEffect(() => {
    // Check if mock auth is enabled
    setIsEnabled(MockAuthService.isActive())
  }, [])

  const toggleMockAuth = () => {
    if (isEnabled) {
      MockAuthService.disable()
      localStorage.setItem('mock_auth_enabled', 'false')
      setIsEnabled(false)
    } else {
      MockAuthService.enable()
      localStorage.setItem('mock_auth_enabled', 'true')
      setIsEnabled(true)
    }
  }

  const testAccounts = MockAuthService.getTestAccounts()

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Mock Authentication</h3>
          <Button
            onClick={toggleMockAuth}
            variant={isEnabled ? "destructive" : "default"}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isEnabled ? "Disable" : "Enable"}
          </Button>
        </div>
        
        <div className="text-sm text-white/80">
          {isEnabled ? (
            <span className="text-green-400 font-medium">✅ Mock authentication is ENABLED</span>
          ) : (
            <span className="text-red-400 font-medium">❌ Mock authentication is DISABLED</span>
          )}
        </div>

        {isEnabled && (
          <div className="space-y-2">
            <Button
              onClick={() => setShowAccounts(!showAccounts)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {showAccounts ? "Hide" : "Show"} Test Accounts
            </Button>

            {showAccounts && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">Available Test Accounts:</h4>
                {testAccounts.map((account, index) => (
                  <div key={index} className="p-2 bg-white rounded border text-xs">
                    <div className="font-mono">
                      <strong>Username:</strong> {account.username}<br/>
                      <strong>Password:</strong> {account.password}<br/>
                      <strong>Role:</strong> {account.role}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {account.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-white/60">
          Bật mock auth để test khi backend bị tắt. Tất cả dữ liệu là giả lập.
        </div>
      </div>
    </div>
  )
}

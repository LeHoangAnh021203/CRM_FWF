"use client"

import { MockAuthToggle } from "@/components/MockAuthToggle"
import { Card } from "@/components/ui/card"

export default function MockAuthPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mock Authentication Management
          </h1>
          <p className="text-gray-600">
            Quản lý tài khoản ảo để test khi backend không khả dụng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock Auth Toggle */}
          <div>
            <MockAuthToggle />
          </div>

          {/* Instructions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Hướng dẫn sử dụng</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-green-600">✅ Khi bật Mock Auth:</h3>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Có thể đăng nhập với tài khoản test</li>
                  <li>Không cần backend API</li>
                  <li>Tất cả dữ liệu là giả lập</li>
                  <li>Token được tạo locally</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-red-600">❌ Khi tắt Mock Auth:</h3>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Sử dụng API backend thật</li>
                  <li>Cần backend server chạy</li>
                  <li>Dữ liệu thật từ database</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-blue-600">🔧 Test Accounts:</h3>
                <div className="mt-2 space-y-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>admin/admin123</strong> - Administrator
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>test/test123</strong> - Regular User
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>manager/manager123</strong> - Manager
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Current Status */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Trạng thái hiện tại</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-blue-800">Test Accounts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">24h</div>
                <div className="text-sm text-green-800">Token Expires</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-sm text-purple-800">Mock Data</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Về trang đăng nhập
          </a>
        </div>
      </div>
    </div>
  )
}

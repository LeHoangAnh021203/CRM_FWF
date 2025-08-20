// Mock Authentication Service for testing when backend is down
export interface MockUser {
  id: number
  firstname: string
  lastname: string
  username: string
  email: string
  phoneNumber: string
  dob: string
  gender: boolean
  bio: string
  avatar: string | null
  role: string
  active: boolean
}

export interface MockLoginResponse {
  access_token: string
  refresh_token: string
  user: MockUser
}

// Mock users database
const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    firstname: "Admin",
    lastname: "User",
    username: "admin",
    email: "admin@fbnetwork.com",
    phoneNumber: "0901234567",
    dob: "1990-01-01",
    gender: true,
    bio: "System Administrator",
    avatar: null,
    role: "ROLE_ADMIN",
    active: true
  },
  {
    id: 2,
    firstname: "Test",
    lastname: "User",
    username: "test",
    email: "test@fbnetwork.com",
    phoneNumber: "0901234568",
    dob: "1995-06-15",
    gender: false,
    bio: "Test User Account",
    avatar: null,
    role: "ROLE_USER",
    active: true
  },
  {
    id: 3,
    firstname: "Manager",
    lastname: "User",
    username: "manager",
    email: "manager@fbnetwork.com",
    phoneNumber: "0901234569",
    dob: "1988-03-20",
    gender: true,
    bio: "Manager Account",
    avatar: null,
    role: "ROLE_MANAGER",
    active: true
  }
]

// Mock credentials (username/password pairs)
const MOCK_CREDENTIALS = {
  admin: "admin123",
  test: "test123", 
  manager: "manager123"
}

// Generate mock JWT token
function generateMockToken(user: MockUser): string {
  const header = { typ: "JWT", alg: "HS256" }
  const payload = {
    sub: user.username,
    authorities: [user.role],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    userId: user.id,
    email: user.email
  }
  
  // Simple base64 encoding (not real JWT signing)
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature = btoa(`mock-signature-${user.username}`)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export class MockAuthService {
  private static isEnabled = false

  // Toggle mock mode
  static enable() {
    this.isEnabled = true
    console.log('[MockAuth] Mock authentication ENABLED')
    console.log('[MockAuth] Available test accounts:')
    console.log('[MockAuth] admin/admin123 (ROLE_ADMIN)')
    console.log('[MockAuth] test/test123 (ROLE_USER)')
    console.log('[MockAuth] manager/manager123 (ROLE_MANAGER)')
  }

  static disable() {
    this.isEnabled = false
    console.log('[MockAuth] Mock authentication DISABLED')
  }

  static isActive(): boolean {
    return this.isEnabled
  }

  // Mock login
  static async login(username: string, password: string): Promise<MockLoginResponse> {
    console.log('[MockAuth] Attempting mock login:', username)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check credentials
    if (MOCK_CREDENTIALS[username as keyof typeof MOCK_CREDENTIALS] !== password) {
      throw new Error('Invalid username or password')
    }
    
    // Find user
    const user = MOCK_USERS.find(u => u.username === username)
    if (!user) {
      throw new Error('User not found')
    }
    
    // Generate tokens
    const access_token = generateMockToken(user)
    const refresh_token = generateMockToken({ ...user, role: 'REFRESH' })
    
    console.log('[MockAuth] Mock login successful for:', username)
    
    return {
      access_token,
      refresh_token,
      user
    }
  }

  // Mock logout
  static async logout(): Promise<void> {
    console.log('[MockAuth] Mock logout')
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Get user permissions from token
  static getUserPermissions(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.authorities || []
    } catch {
      return []
    }
  }

  // Check permission
  static hasPermission(token: string, permission: string): boolean {
    const permissions = this.getUserPermissions(token)
    return permissions.includes(permission)
  }

  // Mock refresh token
  static async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    console.log('[MockAuth] Mock token refresh')
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]))
      const user = MOCK_USERS.find(u => u.id === payload.userId)
      if (!user) throw new Error('User not found')
      
      return {
        access_token: generateMockToken(user)
      }
    } catch {
      throw new Error('Invalid refresh token')
    }
  }

  // Get available test accounts
  static getTestAccounts() {
    return [
      { username: 'admin', password: 'admin123', role: 'ROLE_ADMIN', description: 'Administrator account with full access' },
      { username: 'test', password: 'test123', role: 'ROLE_USER', description: 'Regular user account' },
      { username: 'manager', password: 'manager123', role: 'ROLE_MANAGER', description: 'Manager account with elevated permissions' }
    ]
  }
}

// Auto-enable mock auth in development when backend is unavailable
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Check if we should enable mock auth (can be controlled via localStorage)
  const mockEnabled = localStorage.getItem('mock_auth_enabled')
  if (mockEnabled === 'true') {
    MockAuthService.enable()
    console.log('[MockAuth] Auto-enabled from localStorage')
  }
}

export default MockAuthService

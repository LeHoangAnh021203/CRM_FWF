// Authentication configuration
export const AUTH_CONFIG = {
  // Set to true to force mock mode, false to use API when available
  FORCE_MOCK_MODE: true,
  
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.140:8080',
  
  // Mock users for development/testing
  MOCK_USERS: {
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    manager: { username: 'manager', password: 'manager123', role: 'manager' },
    staff: { username: 'staff', password: 'staff123', role: 'staff' },
    demo: { username: 'demo', password: 'demo123', role: 'manager' }
  }
}

// Helper function to check if we should use mock mode
export function shouldUseMockMode(): boolean {
  // Force mock mode if explicitly set
  if (AUTH_CONFIG.FORCE_MOCK_MODE) {
    return true;
  }
  
  // Use mock if no API URL is configured
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return true;
  }
  
  // Use mock in development if USE_MOCK_AUTH is true
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
    return true;
  }
  
  return false;
}

// Helper function to get API endpoint
export function getApiEndpoint(path: string): string {
  return `${AUTH_CONFIG.API_BASE_URL}/api/${path}`;
}

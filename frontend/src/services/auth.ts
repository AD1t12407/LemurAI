import { ApiService } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  google_calendar_connected: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  // Register a new user
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await ApiService.post('/auth/register', data);
      
      // Store token and user data
      this.setToken(response.data.access_token);
      this.setUser(response.data.user);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  }

  // Login user
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔍 Attempting login with:', { email: data.email });
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
      console.log('📡 Full URL will be:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/auth/login`);

      const response = await ApiService.post('/auth/login', data);
      console.log('✅ Login successful:', response.data);

      // Store token and user data
      this.setToken(response.data.access_token);
      this.setUser(response.data.user);

      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await ApiService.get('/auth/me');
      
      // Update stored user data
      this.setUser(response.data);
      
      return response.data;
    } catch (error: any) {
      // If token is invalid, clear auth data
      this.logout();
      throw new Error(error.response?.data?.detail || 'Failed to get user profile');
    }
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Set token
  private static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get stored user
  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Set user
  private static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Validate token format (basic check)
  static isValidTokenFormat(token: string): boolean {
    // JWT tokens have 3 parts separated by dots
    return token.split('.').length === 3;
  }

  // Get authorization header
  static getAuthHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  // Check if token is expired (basic check - doesn't verify signature)
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Auto-refresh user data if needed
  static async refreshUserIfNeeded(): Promise<User | null> {
    if (!this.isAuthenticated() || this.isTokenExpired()) {
      this.logout();
      return null;
    }

    try {
      return await this.getCurrentUser();
    } catch {
      this.logout();
      return null;
    }
  }
}

export default AuthService;

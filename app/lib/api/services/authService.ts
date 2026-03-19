import { apiClient } from '../apiClient';
// ✅ Import types from your central types file
import { User, AuthResponse } from '@/app/type'; 

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  // Register new user
  async register(data: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response;
  },

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response;
  },

  // ✅ ADD THIS METHOD TO FIX THE ERROR
  async logout(): Promise<void> {
    // If your apiClient has a clearToken method, call it
    if (typeof apiClient.clearToken === 'function') {
      apiClient.clearToken();
    }
    // We handle localStorage removal in the AuthContext.tsx
    return Promise.resolve();
  },

  // Get current user (Matches GET /auth/me)
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  // Forgot Password (Matches POST /auth/forgot-password)
  async sendPasswordResetEmail(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  // Verify Email OTP (Matches POST /auth/verify-email)
  async verifyEmail(email: string, otp: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { email, otp });
  },

  // Send/Resend OTP (Matches POST /auth/send-verification-otp)
  async sendVerificationOtp(email: string): Promise<void> {
    await apiClient.post('/auth/send-verification-otp', { email });
  }
};
import { apiClient } from '../apiClient';
import { User, CreditTransaction } from '@/app/type'; 

export const userService = {
  
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/users/me');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.patch<User>('/users/me', data);
  },


  async getCredits(): Promise<{ credits: number; totalCreditsEarned: number }> {
    const user = await apiClient.get<User>('/users/me');
    return {
      credits: user.credits,
      totalCreditsEarned: user.totalCreditsEarned
    };
  },

  
  async verifyPayment(reference: string, packageId: string): Promise<any> {
    return apiClient.post('/payments/verify', {
      reference,
      packageId
    });
  },


  async deductCredits(amount: number): Promise<void> {
    await apiClient.post('/users/me/deduct-credits', { amount });
  },


  async getCreditTransactions(): Promise<CreditTransaction[]> {
    return apiClient.get<CreditTransaction[]>('/credit-transactions');
  },
  
  
  async getDashboardSummary(): Promise<any> {
    return apiClient.get('/users/me/dashboard');
  }
};
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  subscriptionStatus: 'free' | 'premium';
  subscriptionExpiry?: number; 
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number; 
  explanation?: string; 
  subject: string;
}
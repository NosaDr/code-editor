export interface User {
  id: string; // Changed from uid to id
  email: string;
  displayName: string | null;
  examCategory: 'senior' | 'junior' | 'professional';
  specialization: 'sciences' | 'arts' | 'commercial' | 'general';
  credits: number; 
  totalCreditsEarned: number; 
  emailVerified: boolean;
  createdAt: string;
  // Optional field for frontend transitions
  idToken?: string; 
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number; // Index 0-3
  explanation?: string; 
  subjectId: string; // Changed from subject string to match API logic
  topic?: string;
  imageURL?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// NEW: Matches the package selection logic in your Registration & Payment pages
export const CREDIT_PACKAGES = [
  {
    id: 'starter-basic', // Matches the package ID used in your payment logic
    name: 'Basic Pack',
    credits: 100,
    price: 2000, 
    bonus: 10,
    popular: true,
  },
  {
    id: 'starter-premium',
    name: 'Premium Pack',
    credits: 250,
    price: 5000,
    bonus: 50,
    popular: false,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    credits: 500,
    price: 10000,
    bonus: 150,
    popular: false,
  }
];

export interface CreditTransaction {
  id: string;
  userId: string;
  packageId: string;
  credits: number;
  amount: number;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | string;
  createdAt: string;
}

// These represent how much the backend deducts via /users/me/deduct-credits
export const CREDIT_COSTS = {
  subjectPractice: 5,
  jambMock: 20,      
  waecMock: 15,     
  necoMock: 15,     
  commonEntrance: 10, 
  beceMock: 10,
  interviewPrep: 8,
  generalKnowledge: 5,
  viewExplanation: 1, 
  retakeTest: 3,      
};

export function getCreditCost(examType: string): number {
  const costs: Record<string, number> = {
    'jamb': CREDIT_COSTS.jambMock,
    'waec': CREDIT_COSTS.waecMock,
    'neco': CREDIT_COSTS.necoMock,
    'common-entrance': CREDIT_COSTS.commonEntrance,
    'bece': CREDIT_COSTS.beceMock,
    'interview': CREDIT_COSTS.interviewPrep,
    'general': CREDIT_COSTS.generalKnowledge,
    'subject': CREDIT_COSTS.subjectPractice,
  };
  
  return costs[examType] || CREDIT_COSTS.subjectPractice;
}
import { apiClient } from '../apiClient';

export interface TestResult {
  id: string;
  userId: string;
  subject: string;
  subjectId: string;
  topic?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  type: 'practice' | 'mock';
  history: QuestionHistory[];
}

export interface QuestionHistory {
  questionText: string;
  options: string[];
  correctOption: number;
  selectedOption: number;
  explanation: string;
  imageURL?: string;
}

export const examService = {
  // Submit test results
  async submitTestResult(data: Omit<TestResult, 'id'>): Promise<TestResult> {
    return apiClient.post<TestResult>('/exam/results', data);
  },

  // Get user test results
  async getTestResults(filter?: { type?: string; limit?: number }): Promise<TestResult[]> {
    const params = new URLSearchParams();
    if (filter?.type) params.append('type', filter.type);
    if (filter?.limit) params.append('limit', filter.limit.toString());
    
    return apiClient.get<TestResult[]>(`/exam/results?${params.toString()}`);
  },

  // Get single test result
  async getTestResult(id: string): Promise<TestResult> {
    return apiClient.get<TestResult>(`/exam/results/${id}`);
  },

  // Get user statistics
  async getStatistics(): Promise<any> {
    return apiClient.get('/exam/statistics');
  },
};
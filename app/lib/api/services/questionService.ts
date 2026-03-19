import { apiClient } from '../apiClient';

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  imageURL?: string;
  subject: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionsFilter {
  subject?: string;
  topic?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

export const questionService = {
  // Get questions with filters
  async getQuestions(filter: QuestionsFilter = {}): Promise<Question[]> {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    return apiClient.get<Question[]>(`/questions?${params.toString()}`);
  },

  // Get single question
  async getQuestion(id: string): Promise<Question> {
    return apiClient.get<Question>(`/questions/${id}`);
  },

  // Create question (admin)
  async createQuestion(data: Omit<Question, 'id'>): Promise<Question> {
    return apiClient.post<Question>('/questions', data);
  },

  // Update question (admin)
  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    return apiClient.put<Question>(`/questions/${id}`, data);
  },

  // Delete question (admin)
  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/questions/${id}`);
  },

  // Get questions by subject and topic
  async getQuestionsByTopic(subject: string, topic?: string): Promise<Question[]> {
    return this.getQuestions({ subject, topic });
  },
};
// AI Coach: placeholder service and interfaces
// Keep the contract small so we can plug real AI services later

export interface AIRecommendation {
  id: string;
  type: 'training' | 'nutrition' | 'motivation';
  text: string;
  meta?: Record<string, any>;
}

export interface AICoachService {
  getTrainingRecommendation(userId: string): Promise<AIRecommendation[]>;
  getMotivationMessage(userId: string): Promise<AIRecommendation>;
}

// Minimal stub implementation for development / testing
export class AICoachStub implements AICoachService {
  async getTrainingRecommendation(): Promise<AIRecommendation[]> {
    return [
      { id: 'rec_1', type: 'training', text: 'Try a 3x/week full-body program focused on compound lifts.' }
    ];
  }

  async getMotivationMessage(): Promise<AIRecommendation> {
    return { id: 'mot_1', type: 'motivation', text: "Nice work — keep the consistency! Small wins add up." };
  }
}

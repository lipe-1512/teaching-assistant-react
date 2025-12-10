export interface Goal {
  id: string;
  description: string;
  weight: number;
  createdAt: string;
}

export interface CreateGoalRequest {
  description: string;
  weight: number;
}

export interface UpdateGoalRequest {
  description?: string;
  weight?: number;
}

export class GoalValidator {
  static validateWeight(weight: number): void {
    if (weight < 0 || weight > 100) {
      throw new Error('Goal weight must be between 0 and 100');
    }
  }

  static validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Goal description cannot be empty');
    }
  }

  static validateTotalWeight(goals: Goal[], newWeight?: number): void {
    const total = goals.reduce((sum, g) => sum + g.weight, 0) + (newWeight || 0);
    if (total > 100) {
      throw new Error(`Total weight (${total}%) exceeds 100%`);
    }
  }
}

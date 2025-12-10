import { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types/Goal';

const API_URL = 'http://localhost:3005/api';

export const GoalService = {
  /**
   * Get all goals for a specific class
   */
  async getGoals(classId: string): Promise<Goal[]> {
    const response = await fetch(`${API_URL}/classes/${classId}/goals`);
    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }
    const data = await response.json();
    return data.goals;
  },

  /**
   * Create a new goal for a class
   */
  async createGoal(classId: string, goal: CreateGoalRequest): Promise<Goal> {
    const response = await fetch(`${API_URL}/classes/${classId}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goal),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create goal');
    }
    
    const data = await response.json();
    return data.goal;
  },

  /**
   * Update an existing goal
   */
  async updateGoal(classId: string, goalId: string, updates: UpdateGoalRequest): Promise<Goal> {
    const response = await fetch(`${API_URL}/classes/${classId}/goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update goal');
    }
    
    const data = await response.json();
    return data.goal;
  },

  /**
   * Delete a goal
   */
  async deleteGoal(classId: string, goalId: string): Promise<void> {
    const response = await fetch(`${API_URL}/classes/${classId}/goals/${goalId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete goal');
    }
  },

  /**
   * Clone goals from source class to destination class
   */
  async cloneGoals(destClassId: string, sourceClassId: string): Promise<number> {
    const response = await fetch(`${API_URL}/classes/${destClassId}/goals/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceClassId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to clone goals');
    }
    
    const data = await response.json();
    return data.goalsCloned;
  },
};

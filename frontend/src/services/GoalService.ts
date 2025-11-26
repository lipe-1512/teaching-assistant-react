import { Goal, CreateGoalRequest } from '../types/Goal';

const API_BASE_URL = 'http://localhost:3005';

class GoalService {
  static async getGoals(classId: string): Promise<Goal[]> {
    const resp = await fetch(`${API_BASE_URL}/api/classes/${classId}/goals`);
    if (!resp.ok) throw new Error('Failed to fetch goals');
    return resp.json();
  }

  static async addGoal(classId: string, payload: CreateGoalRequest): Promise<Goal> {
    const resp = await fetch(`${API_BASE_URL}/api/classes/${classId}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create goal');
    }
    return resp.json();
  }

  static async updateGoal(classId: string, goalId: string, payload: Partial<CreateGoalRequest>): Promise<Goal> {
    const resp = await fetch(`${API_BASE_URL}/api/classes/${classId}/goals/${goalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update goal');
    }
    return resp.json();
  }

  static async deleteGoal(classId: string, goalId: string): Promise<void> {
    const resp = await fetch(`${API_BASE_URL}/api/classes/${classId}/goals/${goalId}`, { method: 'DELETE' });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete goal');
    }
  }

  // For cloning we delegate to ClassService /api route - kept here for convenience
  static async cloneGoals(sourceClassId: string, destClassId: string): Promise<{ message: string; clonedGoalsCount: number }> {
    const resp = await fetch(`${API_BASE_URL}/api/classes/${sourceClassId}/clone-goals/${destClassId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to clone goals');
    }

    return resp.json();
  }
}

export default GoalService;

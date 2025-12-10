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

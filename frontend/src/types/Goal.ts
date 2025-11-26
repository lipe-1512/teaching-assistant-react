export interface Goal {
  id: string;
  description: string;
  weight: number;
  createdAt: string; // ISO string
}

export interface CreateGoalRequest {
  description: string;
  weight: number;
}

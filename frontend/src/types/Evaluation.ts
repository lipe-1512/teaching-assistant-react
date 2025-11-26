export type Grade = 'MANA' | 'MPA' | 'MA';

export interface Evaluation {
  goal: string;
  grade: Grade;
}

// Predefined evaluation goals
export const EVALUATION_GOALS = [
  'Requirements',
  'Configuration Management', 
  'Project Management',
  'Design',
  'Tests',
  'Refactoring'
] as const;

export type EvaluationGoal = typeof EVALUATION_GOALS[number];
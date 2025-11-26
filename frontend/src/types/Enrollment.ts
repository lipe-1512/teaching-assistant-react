import { Student } from './Student';
import { Evaluation } from './Evaluation';

export interface Enrollment {
  student: Student;
  evaluations: Evaluation[];
}

export interface CreateEnrollmentRequest {
  studentCPF: string;
  evaluations?: Evaluation[];
}

export interface UpdateEnrollmentRequest {
  evaluations?: Evaluation[];
}
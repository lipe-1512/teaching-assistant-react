import { Student } from './Student';
import { Enrollment } from './Enrollment';
import { EspecificacaoDoCalculoDaMedia } from './EspecificacaoDoCalculoDaMedia';
import { Goal } from './Goal';

export class Class {
  private topic: string;
  private semester: number;
  private year: number;
  private readonly especificacaoDoCalculoDaMedia: EspecificacaoDoCalculoDaMedia;
  private enrollments: Enrollment[];
  private goals: Goal[];

  constructor(topic: string, semester: number, year: number, especificacaoDoCalculoDaMedia: EspecificacaoDoCalculoDaMedia, enrollments: Enrollment[] = [], goals: Goal[] = []) {
    this.topic = topic;
    this.semester = semester;
    this.year = year;
    this.especificacaoDoCalculoDaMedia = especificacaoDoCalculoDaMedia;
    this.enrollments = enrollments;
    this.goals = goals;
  }

  // Getters
  getTopic(): string {
    return this.topic;
  }

  getSemester(): number {
    return this.semester;
  }

  getYear(): number {
    return this.year;
  }

  getEnrollments(): Enrollment[] {
    return [...this.enrollments]; // Return copy to prevent external modification
  }

  getGoals(): Goal[] {
    return [...this.goals]; // Return copy to prevent external modification
  }

  // Generate unique class ID
  getClassId(): string {
    return `${this.topic}-${this.year}-${this.semester}`;
  }

  // Setters for editing
  setTopic(topic: string): void {
    this.topic = topic;
  }

  setSemester(semester: number): void {
    this.semester = semester;
  }

  setYear(year: number): void {
    this.year = year;
  }

  getEspecificacaoDoCalculoDaMedia(): EspecificacaoDoCalculoDaMedia {
    return this.especificacaoDoCalculoDaMedia;
  }

  // Enrollment management
  addEnrollment(student: Student): Enrollment {
    // Check if student is already enrolled
    const existingEnrollment = this.findEnrollmentByStudentCPF(student.getCPF());
    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this class');
    }

    const enrollment = new Enrollment(student);
    this.enrollments.push(enrollment);
    return enrollment;
  }

  removeEnrollment(studentCPF: string): boolean {
    const index = this.enrollments.findIndex(enrollment => 
      enrollment.getStudent().getCPF() === studentCPF
    );
    
    if (index === -1) {
      return false;
    }

    this.enrollments.splice(index, 1);
    return true;
  }

  findEnrollmentByStudentCPF(studentCPF: string): Enrollment | undefined {
    return this.enrollments.find(enrollment => 
      enrollment.getStudent().getCPF() === studentCPF
    );
  }

  // Get all enrolled students
  getEnrolledStudents(): Student[] {
    return this.enrollments.map(enrollment => enrollment.getStudent());
  }

  // Goal management
  addGoal(goal: Goal): void {
    this.goals.push(goal);
  }

  removeGoal(goalId: string): boolean {
    const index = this.goals.findIndex(g => g.id === goalId);
    if (index === -1) {
      return false;
    }
    this.goals.splice(index, 1);
    return true;
  }

  updateGoal(goalId: string, updates: Partial<Goal>): Goal | null {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) {
      return null;
    }
    Object.assign(goal, updates);
    return goal;
  }

  findGoalById(goalId: string): Goal | undefined {
    return this.goals.find(g => g.id === goalId);
  }

  // Clone goals from another class
  cloneGoalsFrom(sourceClass: Class): void {
    const clonedGoals = sourceClass.getGoals().map(goal => ({
      ...goal,
      id: `${goal.id}-clone-${Date.now()}`,
      createdAt: new Date().toISOString()
    }));
    this.goals.push(...clonedGoals);
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.getClassId(),
      topic: this.topic,
      semester: this.semester,
      year: this.year,
      especificacaoDoCalculoDaMedia: this.especificacaoDoCalculoDaMedia.toJSON(),
      enrollments: this.enrollments.map(enrollment => enrollment.toJSON()),
      goals: this.goals
    };
  }

  // Create Class from JSON object
  static fromJSON(data: { topic: string; semester: number; year: number; especificacaoDoCalculoDaMedia: any, enrollments: any[], goals?: Goal[] }, allStudents: Student[]): Class {
    const enrollments = data.enrollments
      ? data.enrollments.map((enrollmentData: any) => {
          const student = allStudents.find(s => s.getCPF() === enrollmentData.student.cpf);
          if (!student) {
            throw new Error(`Student with CPF ${enrollmentData.student.cpf} not found`);
          }
          return Enrollment.fromJSON(enrollmentData, student);
        })
      : [];
    
    // Novo carregamento do EspecificacaoDoCalculoDaMedia
    const especificacaoDoCalculoDaMedia = EspecificacaoDoCalculoDaMedia.fromJSON(data.especificacaoDoCalculoDaMedia);

    const goals = data.goals || [];

    return new Class(data.topic, data.semester, data.year, especificacaoDoCalculoDaMedia, enrollments, goals);
  }
}

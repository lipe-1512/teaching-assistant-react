import { Student } from './Student';
import { Enrollment } from './Enrollment';
import { Goal } from './Goal';

// O QUE: Importa o modelo Goal e adiciona a propriedade "goals" para armazenar metas relacionadas à disciplina. O construtor foi atualizado para aceitar goals.
// POR QUÊ: Garantir que cada classe tenha suas metas encapsuladas para permitir operações específicas como clonagem de metas.
// POSITIVOS: Mantém alta coesão do modelo Class, permitindo encapsular metas e operações relacionadas dentro da mesma classe.
// NEGATIVOS: Acrescenta complexidade ao construtor e ao modelo, exigindo atualização de persistência dos dados.
// IMPACTO: Necessária atualização da serialização e desserialização para incluir metas.

export class Class {
  private topic: string;
  private semester: number;
  private year: number;
  private enrollments: Enrollment[];
  private goals: Goal[];

  constructor(
    topic: string,
    semester: number,
    year: number,
    enrollments: Enrollment[] = [],
    goals: Goal[] = []
  ) {
    this.topic = topic;
    this.semester = semester;
    this.year = year;
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
    return [...this.goals]; // Retorna cópia para evitar modificação externa
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

  // Clona as metas da disciplina, retornando uma lista de novos Goals com novos IDs
  cloneGoals(): Goal[] {
    return this.goals.map(goal => goal.clone());
  }

  // Goal management
  addGoal(goal: Goal): Goal {
    // Accept a Goal instance and store it. The goal may already be a cloned instance
    // (with a new id) or a freshly created Goal — we push it directly to preserve
    // its id and createdAt fields.
    this.goals.push(goal);
    return goal;
  }

  findGoalById(goalId: string): Goal | undefined {
    return this.goals.find(g => g.getId() === goalId);
  }

  updateGoal(goalId: string, description?: string, weight?: number): Goal {
    const found = this.findGoalById(goalId);
    if (!found) throw new Error('Goal not found');
    if (description !== undefined) found.setDescription(description);
    if (weight !== undefined) found.setWeight(weight);
    return found;
  }

  removeGoal(goalId: string): boolean {
    const index = this.goals.findIndex(g => g.getId() === goalId);
    if (index === -1) return false;
    this.goals.splice(index, 1);
    return true;
  }

  // Convert to JSON for API responses, incluindo as metas
  toJSON() {
    return {
      id: this.getClassId(),
      topic: this.topic,
      semester: this.semester,
      year: this.year,
      enrollments: this.enrollments.map(enrollment => enrollment.toJSON()),
      goals: this.goals.map(goal => goal.toJSON())
    };
  }

  // Create Class from JSON object, carregando metas também
  static fromJSON(data: { topic: string; semester: number; year: number; enrollments: any[]; goals?: any[] }, allStudents: Student[]): Class {
    const enrollments = data.enrollments
      ? data.enrollments.map((enrollmentData: any) => {
          const cpf = enrollmentData.studentCPF || enrollmentData.student?.cpf;
          const student = allStudents.find(s => s.getCPF() === cpf);
          if (!student) {
            throw new Error(`Student with CPF ${cpf} not found`);
          }
          return Enrollment.fromJSON(enrollmentData, student);
        })
      : [];

    const goals = data.goals
      ? data.goals.map((goalData: any) => Goal.fromJSON(goalData))
      : [];

    return new Class(data.topic, data.semester, data.year, enrollments, goals);
  }
}

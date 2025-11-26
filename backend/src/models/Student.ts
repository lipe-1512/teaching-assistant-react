import { Evaluation } from './Evaluation';

export class Student {
  constructor(
    public name: string,
    public cpf: string,
    public email: string
  ) {
    this.cpf = this.cleanCPF(cpf); // Store only clean CPF internally
    this.validateCPF(this.cpf);
    this.validateEmail(email);
  }

  private cleanCPF(cpf: string): string {
    return cpf.replace(/[.-]/g, '');
  }

  private validateCPF(cleanCPF: string): void {
    if (cleanCPF.length !== 11 || !/^\d+$/.test(cleanCPF)) {
      throw new Error('Invalid CPF format');
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  // Format CPF for display (000.000.000-00)
  getFormattedCPF(): string {
    return this.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Get CPF (stored clean internally)
  getCPF(): string {
    return this.cpf;
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      name: this.name,
      cpf: this.getFormattedCPF(),
      email: this.email
    };
  }
}
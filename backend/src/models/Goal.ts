import { randomUUID } from 'crypto';

export class Goal {
  private id: string;
  private description: string;
  private weight: number;
  private createdAt: Date;

  constructor(description: string, weight: number, id?: string, createdAt?: Date) {
    // Use Node's built-in randomUUID to avoid ESM issues with the 'uuid' package in tests
    this.id = id ?? randomUUID();
    this.description = description;
    this.weight = weight;
    this.createdAt = createdAt ?? new Date();
  }

  getId(): string {
    return this.id;
  }

  getDescription(): string {
    return this.description;
  }

  getWeight(): number {
    return this.weight;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setWeight(weight: number): void {
    this.weight = weight;
  }

  clone(): Goal {
    // Returns a new Goal instance with a new id but preserves description, weight and createdAt
    // We pass undefined for id so constructor generates a new uuid, and preserve createdAt
    return new Goal(this.description, this.weight, undefined, this.createdAt);
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      weight: this.weight,
      createdAt: this.createdAt.toISOString()
    };
  }

  static fromJSON(data: any): Goal {
    return new Goal(
      data.description,
      data.weight,
      data.id,
      data.createdAt ? new Date(data.createdAt) : undefined
    );
  }
}

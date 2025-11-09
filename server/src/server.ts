import express, { Request, Response } from 'express';
import cors from 'cors';
import { StudentSet } from './models/StudentSet';
import { Student } from './models/Student';
import { Evaluation } from './models/Evaluation';

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory student storage (in production, use a database)
const studentSet = new StudentSet();

// Add some sample data for testing
const initializeSampleData = () => {
  try {
    // Sample student 1 with evaluations
    const student1 = new Student('João Silva', '123.456.789-01', 'joao@email.com', [
      new Evaluation('Requirements', 'MA'),
      new Evaluation('Design', 'MPA'),
      new Evaluation('Tests', 'MANA')
    ]);
    
    // Sample student 2 with evaluations  
    const student2 = new Student('Maria Santos', '987.654.321-09', 'maria@email.com', [
      new Evaluation('Requirements', 'MPA'),
      new Evaluation('Configuration Management', 'MA'),
      new Evaluation('Project Management', 'MA')
    ]);
    
    studentSet.addStudent(student1);
    studentSet.addStudent(student2);
    
    console.log('Sample data initialized');
  } catch (error) {
    console.log('Sample data already exists or error:', (error as Error).message);
  }
};

// Initialize sample data on server start
initializeSampleData();

// Helper function to clean CPF
const cleanCPF = (cpf: string): string => {
  return cpf.replace(/[.-]/g, '');
};

// Routes

// GET /api/students - Get all students
app.get('/api/students', (req: Request, res: Response) => {
  try {
    const students = studentSet.getAllStudents();
    res.json(students.map(s => s.toJSON()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/students - Add a new student
app.post('/api/students', (req: Request, res: Response) => {
  try {
    const { name, cpf, email, evaluations } = req.body;
    
    if (!name || !cpf || !email) {
      return res.status(400).json({ error: 'Name, CPF, and email are required' });
    }

    // Convert evaluations from JSON to Evaluation objects if provided
    const evaluationObjects = evaluations 
      ? evaluations.map((evaluation: any) => Evaluation.fromJSON(evaluation))
      : [];

    const student = new Student(name, cpf, email, evaluationObjects);
    const addedStudent = studentSet.addStudent(student);
    res.status(201).json(addedStudent.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// PUT /api/students/:cpf - Update a student (basic info only)
app.put('/api/students/:cpf', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required for update' });
    }
    
    // Create a Student object for update with empty evaluations (they won't be used anyway)
    const updatedStudent = new Student(name, cpf, email, []);
    const result = studentSet.updateStudent(updatedStudent);
    res.json(result.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// DELETE /api/students/:cpf - Delete a student
app.delete('/api/students/:cpf', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const cleanedCPF = cleanCPF(cpf);
    const success = studentSet.removeStudent(cleanedCPF);
    
    if (!success) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// PUT /api/students/:cpf/evaluation - Update a specific evaluation
app.put('/api/students/:cpf/evaluation', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const { goal, grade } = req.body;
    
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }
    
    const cleanedCPF = cleanCPF(cpf);
    const student = studentSet.findStudentByCPF(cleanedCPF);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    if (grade === '' || grade === null || grade === undefined) {
      // Remove evaluation
      student.removeEvaluation(goal);
    } else {
      // Add or update evaluation
      if (!['MANA', 'MPA', 'MA'].includes(grade)) {
        return res.status(400).json({ error: 'Invalid grade. Must be MANA, MPA, or MA' });
      }
      student.addOrUpdateEvaluation(goal, grade);
    }
    
    res.json(student.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// GET /api/students/:cpf - Get a specific student
app.get('/api/students/:cpf', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const cleanedCPF = cleanCPF(cpf);
    const student = studentSet.findStudentByCPF(cleanedCPF);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
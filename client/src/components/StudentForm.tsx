import React, { useState, useEffect } from 'react';
import { Student } from '../types/Student';

interface StudentFormProps {
  onSubmit: (student: { name: string; cpf: string; email: string }) => Promise<void>;
  onCancel?: () => void;
  editingStudent?: Student | null;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, onCancel, editingStudent }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when editingStudent changes
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        cpf: editingStudent.cpf,
        email: editingStudent.email
      });
    } else {
      // Reset form for new student
      setFormData({
        name: '',
        cpf: '',
        email: ''
      });
    }
  }, [editingStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Form will be reset by useEffect when editingStudent changes to null
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCPF = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply CPF mask (000.000.000-00)
    if (digits.length <= 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return digits.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({
      ...prev,
      cpf: formatted
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <h2>
        {editingStudent ? (
          <>
            Edit Student
            <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
              (CPF: {editingStudent.cpf})
            </span>
          </>
        ) : (
          'Add New Student'
        )}
      </h2>
      
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder={editingStudent ? "Student's full name" : "Enter student's full name"}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cpf">CPF:</label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={formData.cpf}
          onChange={handleCPFChange}
          required
          placeholder="000.000.000-00"
          maxLength={14}
          disabled={!!editingStudent} // Disable CPF editing for existing students
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder={editingStudent ? "Student's email address" : "student@example.com"}
        />
      </div>

      <div className="form-buttons">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (editingStudent ? 'Update Student' : 'Add Student')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default StudentForm;
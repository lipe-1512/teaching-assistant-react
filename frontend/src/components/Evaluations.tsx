import React, { useState, useEffect, useCallback } from 'react';
import { Class } from '../types/Class';
import ClassService from '../services/ClassService';
import EnrollmentService from '../services/EnrollmentService';

import { ImportGradeComponent } from './ImportGrade';

interface EvaluationsProps {
  onError: (errorMessage: string) => void;
}

const Evaluations: React.FC<EvaluationsProps> = ({ onError }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    // Load previously selected class from localStorage
    return localStorage.getItem('evaluations-selected-class') || '';
  });
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clone goals state
  const [sourceClassIdForCloning, setSourceClassIdForCloning] = useState<string>('');
  const [isCloning, setIsCloning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingCloneData, setPendingCloneData] = useState<{ sourceId: string; destId: string } | null>(null);

  // Predefined evaluation goals
  const evaluationGoals = [
    'Requirements',
    'Configuration Management', 
    'Project Management',
    'Design',
    'Tests',
    'Refactoring'
  ];

  const loadClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const classesData = await ClassService.getAllClasses();
      setClasses(classesData);
    } catch (error) {
      onError(`Failed to load classes: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Load all classes on component mount
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Update selected class when selectedClassId changes
  useEffect(() => {
    if (selectedClassId) {
      const classObj = classes.find(c => c.id === selectedClassId);
      setSelectedClass(classObj || null);
    } else {
      setSelectedClass(null);
    }
  }, [selectedClassId, classes]);

  const handleClassSelection = (classId: string) => {
    setSelectedClassId(classId);
    // Save selected class to localStorage for persistence
    if (classId) {
      localStorage.setItem('evaluations-selected-class', classId);
    } else {
      localStorage.removeItem('evaluations-selected-class');
    }
  };

  const handleEvaluationChange = async (studentCPF: string, goal: string, grade: string) => {
    if (!selectedClass) {
      onError('No class selected');
      return;
    }

    try {
      await EnrollmentService.updateEvaluation(selectedClass.id, studentCPF, goal, grade);
      // Reload classes to get updated enrollment data
      await loadClasses();
    } catch (error) {
      onError(`Failed to update evaluation: ${(error as Error).message}`);
    }
  };

  // Clone goals handlers
  const handleCloneGoals = async () => {
    if (!selectedClassId || !sourceClassIdForCloning) {
      onError('Please select both source and destination classes');
      return;
    }

    if (sourceClassIdForCloning === selectedClassId) {
      onError('Source and destination classes cannot be the same');
      return;
    }

    setIsCloning(true);

    try {
      await ClassService.cloneGoals(sourceClassIdForCloning, selectedClassId);
      // Reload classes to get updated data
      await loadClasses();
      onError(''); // Clear any previous errors
      setSourceClassIdForCloning('');
    } catch (error: any) {
      const errorMessage = error.message;

      // Check if it's a conflict (destination already has goals)
      if (errorMessage.includes('already has evaluation goals')) {
        setPendingCloneData({ sourceId: sourceClassIdForCloning, destId: selectedClassId });
        setShowConfirmDialog(true);
        return;
      }

      onError(errorMessage);
    } finally {
      setIsCloning(false);
    }
  };

  const handleConfirmClone = async () => {
    if (!pendingCloneData) return;

    setShowConfirmDialog(false);
    setIsCloning(true);

    try {
      // Since the backend doesn't support force cloning yet, we'll show an informative message
      // In a full implementation, this would call a force clone endpoint
      onError('Force cloning is not implemented yet. Please clear existing goals first.');
      setPendingCloneData(null);
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsCloning(false);
    }
  };

  const handleCancelClone = () => {
    setShowConfirmDialog(false);
    setPendingCloneData(null);
  };

  if (isLoading) {
    return (
      <div className="evaluation-section">
        <h3>Evaluations</h3>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading classes...
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-section">
      <h3>Evaluations</h3>
      
      {/* Class Selection */}
      <div className="class-selection-container">
        <label htmlFor="classSelect">Select Class:</label>
        <select
          id="classSelect"
          value={selectedClassId}
          onChange={(e) => handleClassSelection(e.target.value)}
          className="class-select"
        >
          <option value="">-- Select a class --</option>
          {classes.map((classObj) => (
            <option key={classObj.id} value={classObj.id}>
              {classObj.topic} ({classObj.year}/{classObj.semester})
            </option>
          ))}
        </select>
      </div>

      {!selectedClass && (
        <div style={{ 
          padding: '20px', 
          border: '2px dashed #ccc', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: '#666',
          marginTop: '20px'
        }}>
          <h4>No Class Selected</h4>
          <p>Please select a class to view and manage evaluations.</p>
        </div>
      )}

      {selectedClass && selectedClass.enrollments.length === 0 && (
        <div style={{ 
          padding: '20px', 
          border: '2px dashed #ccc', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: '#666',
          marginTop: '20px'
        }}>
          <h4>No Students Enrolled</h4>
          <p>This class has no enrolled students yet.</p>
          <p>Add students in the Students tab first.</p>
        </div>
      )}

      {selectedClass && selectedClass.enrollments.length > 0 && (
        <div className="evaluation-table-container">
          {/* Clone Goals Section */}
          <div className="clone-goals-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>Clone Goals from Another Class</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <div>
                <label htmlFor="sourceClassSelect" style={{ display: 'block', marginBottom: '5px' }}>Source Class:</label>
                <select
                  id="sourceClassSelect"
                  value={sourceClassIdForCloning}
                  onChange={(e) => setSourceClassIdForCloning(e.target.value)}
                  style={{ padding: '5px', minWidth: '200px' }}
                >
                  <option value="">-- Select source class --</option>
                  {classes.filter(c => c.id !== selectedClassId).map((classObj) => (
                    <option key={classObj.id} value={classObj.id}>
                      {classObj.topic} ({classObj.year}/{classObj.semester})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  onClick={handleCloneGoals}
                  disabled={isCloning || !sourceClassIdForCloning}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isCloning ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isCloning ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isCloning ? 'Cloning...' : 'Clone Goals'}
                </button>
              </div>
            </div>
          </div>

          {/*Componente de importacao de notas de uma planilha, vai reagir as mudacas do classId */}
          <div>
            <ImportGradeComponent classID={selectedClassId} />
          </div>
          <h4>{selectedClass.topic} ({selectedClass.year}/{selectedClass.semester})</h4>

          <div className="evaluation-matrix">
            <table className="evaluation-table">
              <thead>
                <tr>
                  <th className="student-name-header">Student</th>
                  {evaluationGoals.map(goal => (
                    <th key={goal} className="goal-header">{goal}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedClass.enrollments.map(enrollment => {
                  const student = enrollment.student;

                  // Create a map of evaluations for quick lookup
                  const studentEvaluations = enrollment.evaluations.reduce((acc, evaluation) => {
                    acc[evaluation.goal] = evaluation.grade;
                    return acc;
                  }, {} as {[goal: string]: string});

                  return (
                    <tr key={student.cpf} className="student-row">
                      <td className="student-name-cell">{student.name}</td>
                      {evaluationGoals.map(goal => {
                        const currentGrade = studentEvaluations[goal] || '';

                        return (
                          <td key={goal} className="evaluation-cell">
                            <select
                              value={currentGrade}
                              onChange={(e) => handleEvaluationChange(student.cpf, goal, e.target.value)}
                              className={`evaluation-select ${currentGrade ? `grade-${currentGrade.toLowerCase()}` : ''}`}
                            >
                              <option value="">-</option>
                              <option value="MANA">MANA</option>
                              <option value="MPA">MPA</option>
                              <option value="MA">MA</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h4>Confirm Goal Cloning</h4>
            <p>The destination class already has evaluation goals. This action will overwrite existing data.</p>
            <p>Do you want to continue?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={handleCancelClone}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClone}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluations;
import React, { useState, useEffect } from 'react';
import { Goal, CreateGoalRequest } from '../types/Goal';
import { GoalService } from '../services/GoalService';

interface GoalsProps {
  classId: string;
}

export const Goals: React.FC<GoalsProps> = ({ classId }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalWeight, setNewGoalWeight] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editWeight, setEditWeight] = useState('');

  useEffect(() => {
    loadGoals();
  }, [classId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const fetchedGoals = await GoalService.getGoals(classId);
      setGoals(fetchedGoals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const weight = parseFloat(newGoalWeight);
    if (isNaN(weight) || weight < 0 || weight > 100) {
      setError('Weight must be between 0 and 100');
      return;
    }

    try {
      const newGoal: CreateGoalRequest = {
        description: newGoalDescription.trim(),
        weight,
      };

      await GoalService.createGoal(classId, newGoal);
      setNewGoalDescription('');
      setNewGoalWeight('');
      setError(null);
      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await GoalService.deleteGoal(classId, goalId);
      setError(null);
      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditDescription(goal.description);
    setEditWeight(goal.weight.toString());
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setEditDescription('');
    setEditWeight('');
  };

  const handleUpdateGoal = async (goalId: string) => {
    const weight = parseFloat(editWeight);
    if (isNaN(weight) || weight < 0 || weight > 100) {
      setError('Weight must be between 0 and 100');
      return;
    }

    try {
      await GoalService.updateGoal(classId, goalId, {
        description: editDescription.trim(),
        weight,
      });
      setEditingGoalId(null);
      setEditDescription('');
      setEditWeight('');
      setError(null);
      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    }
  };

  const getTotalWeight = (): number => {
    return goals.reduce((sum, goal) => sum + goal.weight, 0);
  };

  if (loading) {
    return <div>Loading goals...</div>;
  }

  const totalWeight = getTotalWeight();
  const isOverWeight = totalWeight > 100;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Goals Management</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: isOverWeight ? '#ffeeee' : '#eeffee', borderRadius: '4px' }}>
        <strong>Total Weight: {totalWeight.toFixed(2)}%</strong>
        {isOverWeight && <span style={{ color: 'red', marginLeft: '10px' }}>⚠️ Total exceeds 100%!</span>}
      </div>

      {/* Create New Goal Form */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Add New Goal</h3>
        <form onSubmit={handleCreateGoal}>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Description:
              <input
                type="text"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Weight (%):
              <input
                type="number"
                value={newGoalWeight}
                onChange={(e) => setNewGoalWeight(e.target.value)}
                required
                min="0"
                max="100"
                step="0.01"
                style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
              />
            </label>
          </div>
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add Goal
          </button>
        </form>
      </div>

      {/* Goals List */}
      <div>
        <h3>Current Goals ({goals.length})</h3>
        {goals.length === 0 ? (
          <p>No goals yet. Add your first goal above.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Weight (%)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created At</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <tr key={goal.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editingGoalId === goal.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        style={{ width: '100%', padding: '4px' }}
                      />
                    ) : (
                      goal.description
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editingGoalId === goal.id ? (
                      <input
                        type="number"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                        style={{ width: '80px', padding: '4px' }}
                      />
                    ) : (
                      goal.weight.toFixed(2)
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {new Date(goal.createdAt).toLocaleString()}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editingGoalId === goal.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateGoal(goal.id)}
                          style={{ padding: '4px 8px', marginRight: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          style={{ padding: '4px 8px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(goal)}
                          style={{ padding: '4px 8px', marginRight: '5px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          style={{ padding: '4px 8px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

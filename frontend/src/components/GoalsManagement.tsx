import React, { useEffect, useState } from 'react';
import { Goal } from '../types/Goal';
import GoalService from '../services/GoalService';

interface Props {
  classId: string;
}

const GoalsManagement: React.FC<Props> = ({ classId }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [createDesc, setCreateDesc] = useState('');
  const [createWeight, setCreateWeight] = useState<number>(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editWeight, setEditWeight] = useState<number>(0);

  const loadGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await GoalService.getGoals(classId);
      setGoals(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await GoalService.addGoal(classId, { description: createDesc, weight: createWeight });
      setCreateDesc('');
      setCreateWeight(0);
      await loadGoals();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startEdit = (g: Goal) => {
    setEditingId(g.id);
    setEditDesc(g.description);
    setEditWeight(g.weight);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError('');
    try {
      await GoalService.updateGoal(classId, editingId, { description: editDesc, weight: editWeight });
      setEditingId(null);
      await loadGoals();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!window.confirm('Delete this goal?')) return;
    setError('');
    try {
      await GoalService.deleteGoal(classId, goalId);
      await loadGoals();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="goals-management">
      <h3>Goals</h3>
      {loading && <div>Loading goals...</div>}
      {error && <div className="error">{error}</div>}

      <div className="goals-list">
        {goals.length === 0 ? (
          <div>No goals defined for this class</div>
        ) : (
          <ul>
            {goals.map(g => (
              <li key={g.id} className="goal-item">
                {editingId === g.id ? (
                  <form onSubmit={handleUpdate} className="edit-goal-form">
                    <input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                    <input type="number" value={editWeight} onChange={e => setEditWeight(parseInt(e.target.value))} />
                    <button type="submit">Save</button>
                    <button type="button" onClick={cancelEdit}>Cancel</button>
                  </form>
                ) : (
                  <div className="goal-row">
                    <div className="goal-text"><strong>{g.description}</strong> ({g.weight}%)</div>
                    <div className="goal-actions">
                      <button onClick={() => startEdit(g)}>Edit</button>
                      <button onClick={() => handleDelete(g.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="goals-create">
        <h4>Add Goal</h4>
        <form onSubmit={handleAdd} className="add-goal-form">
          <input placeholder="Description" value={createDesc} onChange={e => setCreateDesc(e.target.value)} required />
          <input type="number" placeholder="Weight" value={createWeight} onChange={e => setCreateWeight(parseInt(e.target.value))} required />
          <button type="submit">Add Goal</button>
        </form>
      </div>
    </div>
  );
};

export default GoalsManagement;

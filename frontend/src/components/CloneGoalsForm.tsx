import React, { useEffect, useState } from 'react';
import ClassService from '../services/ClassService';
import GoalService from '../services/GoalService';
import { Class } from '../types/Class';

interface Props {
  destClassId: string;
  onCloneSuccess?: (count: number) => void;
}

const CloneGoalsForm: React.FC<Props> = ({ destClassId, onCloneSuccess }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sourceId, setSourceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await ClassService.getAllClasses();
        setClasses(data.filter(c => c.id !== destClassId));
        if (data.length > 0) setSourceId(data[0].id);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [destClassId]);

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await GoalService.cloneGoals(sourceId, destClassId);
      setMessage(res.message);
      onCloneSuccess?.(res.clonedGoalsCount);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clone-goals-form">
      <h4>Clone Goals into this Class</h4>
      <form onSubmit={handleClone}>
        <div className="form-row">
          <label>Source class</label>
          <select value={sourceId} onChange={e => setSourceId(e.target.value)}>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.topic} ({c.year}/{c.semester})</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading || !sourceId}> {loading ? 'Cloning...' : 'Clone Goals'}</button>
        </div>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default CloneGoalsForm;

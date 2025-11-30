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
        // Filter out current class AND classes with no goals
        const availableClasses = data.filter(c => 
          c.id !== destClassId && 
          c.goals && 
          c.goals.length > 0
        );
        setClasses(availableClasses);
        if (availableClasses.length > 0) setSourceId(availableClasses[0].id);
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
      const errorMsg = (err as Error).message;
      if (errorMsg.includes('already has goals') || errorMsg.includes('duplicate goals')) {
        setError('❌ This class already has goals defined. Please delete all existing goals before cloning, or create goals manually.');
      } else if (errorMsg.includes('no goals')) {
        setError('⚠️ The source class has no goals to clone. Please select a different class.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clone-goals-form" style={{ 
      padding: '20px', 
      backgroundColor: '#fff5f5', 
      borderRadius: '8px', 
      marginBottom: '30px',
      border: '2px solid #dc2626'
    }}>
      <h4 style={{ marginBottom: '15px', color: '#dc2626' }}>📋➡️📋 Clone Goals into this Class</h4>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
        Copy all goals from another class to this one. This is useful for reusing goal structures across semesters.
      </p>
      
      {classes.length === 0 ? (
        <div style={{ padding: '15px', backgroundColor: '#fef2f2', borderRadius: '4px', color: '#991b1b' }}>
          ⚠️ No classes with goals available to clone from.
          <p style={{ fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>
            Create goals in another class first, or add goals manually below.
          </p>
        </div>
      ) : (
        <form onSubmit={handleClone}>
          <div className="form-row" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              📚 Select Source Class (with goals):
            </label>
            <select 
              value={sourceId} 
              onChange={e => setSourceId(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '2px solid #dc2626',
                fontSize: '14px'
              }}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.topic} - {c.year}/{c.semester} ({c.goals?.length || 0} goals)
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading || !sourceId}
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading || !sourceId ? 'not-allowed' : 'pointer',
                opacity: loading || !sourceId ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Cloning...' : '🚀 Clone Goals'}
            </button>
          </div>
          
          {message && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              backgroundColor: '#dcfce7', 
              color: '#166534',
              borderRadius: '4px',
              border: '1px solid #22c55e'
            }}>
              ✅ {message}
            </div>
          )}
          {error && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              backgroundColor: '#fee2e2', 
              color: '#991b1b',
              borderRadius: '4px',
              border: '1px solid #ef4444'
            }}>
              ❌ {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CloneGoalsForm;

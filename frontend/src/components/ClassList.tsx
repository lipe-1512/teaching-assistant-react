import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClassService from '../services/ClassService';
import { Class } from '../types/Class';

const ClassList: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await ClassService.getAllClasses();
        setClasses(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading classes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="class-list">
      <h2>Classes</h2>
      {classes.length === 0 ? (
        <div>No classes available</div>
      ) : (
        <ul>
          {classes.map(c => (
            <li key={c.id}>
              <div>
                <strong>{c.topic}</strong> ({c.year}/{c.semester})
              </div>
              <div className="actions">
                <Link to={`/classes/${c.id}/goals`}>Manage Goals</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassList;

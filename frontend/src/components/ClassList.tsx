import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClassService from '../services/ClassService';
import { Class } from '../types/Class';

const ClassList: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    year: new Date().getFullYear(),
    semester: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await ClassService.getAllClasses();
      setClasses(data);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError('Topic is required');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await ClassService.addClass(formData);
      setFormData({ topic: '', year: new Date().getFullYear(), semester: 1 });
      setShowForm(false);
      await loadClasses();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (classId: string, className: string) => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete the class "${className}"?\n\n` +
      `This action will permanently delete:\n` +
      `• All goals associated with this class\n` +
      `• All student enrollments\n` +
      `• All evaluations\n\n` +
      `This action cannot be undone!`
    );

    if (!confirmed) return;

    setError('');
    try {
      await ClassService.deleteClass(classId);
      await loadClasses();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>⏳ Loading classes...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p>❌ {error}</p>
    </div>
  );

  return (
    <div className="class-list-container">
      <div className="page-header">
        <div>
          <h2>📚 Classes</h2>
          <p className="subtitle">Manage your classes and goals</p>
        </div>
        <button 
          className="btn-add-class" 
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            background: showForm ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            color: 'white',
            transition: 'all 0.3s ease'
          }}
        >
          {showForm ? '❌ Cancel' : '➕ Add New Class'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '20px',
          backgroundColor: '#fee2e2', 
          color: '#991b1b',
          borderRadius: '8px',
          border: '2px solid #dc2626'
        }}>
          ❌ {error}
        </div>
      )}

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '2px solid #dc2626',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#dc2626' }}>➕ Create New Class</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                📚 Topic / Subject:
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Engenharia de Software e Sistemas"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  📅 Year:
                </label>
                <select
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  {[2024, 2025, 2026, 2027, 2028].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  📆 Semester:
                </label>
                <select
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value={1}>1st Semester</option>
                  <option value={2}>2nd Semester</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '12px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: 'white',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {submitting ? '⏳ Creating...' : '✅ Create Class'}
            </button>
          </form>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="empty-state">
          <p>📭 No classes available yet</p>
          <p className="empty-hint">Classes will appear here once they are created</p>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map(c => (
            <div key={c.id} className="class-card" style={{ cursor: 'pointer', position: 'relative' }}>
              <Link 
                to={`/classes/${c.id}/goals`} 
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  display: 'block'
                }}
              >
                <div className="class-card-header">
                  <h3>{c.topic}</h3>
                  <span className="class-badge">{c.year}/{c.semester}</span>
                </div>
                
                <div className="class-card-body">
                  <div className="class-info">
                    <span className="info-item">
                      👥 <strong>{c.enrollments.length}</strong> students enrolled
                    </span>
                  </div>
                </div>
              </Link>

              <div className="class-card-footer">
                <Link to={`/classes/${c.id}/goals`} className="btn-manage-goals">
                  🎯 Manage Goals
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id, `${c.topic} - ${c.year}/${c.semester}`);
                  }}
                  className="btn-delete-class"
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    marginTop: '8px',
                    width: '100%'
                  }}
                  title="Delete this class"
                >
                  🗑️ Delete Class
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassList;

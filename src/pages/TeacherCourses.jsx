import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchCourses, createCourse, updateCourse, deleteCourse } from '../api/courses';
import { getCategories } from '../api/categories';
import { useAuth } from '../context/AuthContext';

export default function TeacherCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [coursesData, categoriesData] = await Promise.all([
      searchCourses(),
      getCategories()
    ]);
    // Filter to show only teacher's own courses
    const teacherCourses = coursesData.filter(course => course.teacher_id === user.userId);
    setCourses(teacherCourses);
    setCategories(categoriesData);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      category_id: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.course_title,
      description: course.course_description,
      category_id: course.category_id?.toString() || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await deleteCourse(courseId, { teacher_email: user.email });
      await loadData();
    } catch (err) {
      alert('Failed to delete course: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.category_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        teacher_email: user.email
      };

      // Add teacher_id for create (required by backend)
      if (!editingCourse) {
        payload.teacher_id = user.userId;
      }

      if (editingCourse) {
        await updateCourse(editingCourse.course_id, payload);
      } else {
        await createCourse(payload);
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save course');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>My Courses</h1>
        <button
          onClick={handleCreate}
          style={{
            padding: '12px 24px',
            background: '#2ea67a',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          + Create Course
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f5f5f5', borderRadius: 12 }}>
          <p style={{ fontSize: 18, color: '#666' }}>No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {courses.map(course => (
            <div key={course.course_id} style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 20 }}>{course.course_title}</h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 16, flex: 1 }}>
                {course.course_description}
              </p>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
                Category: {categories.find(c => c.category_id === course.category_id)?.category_name || 'N/A'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  to={`/teacher/courses/${course.course_id}`}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#b8e6d5',
                    color: '#2ea67a',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textAlign: 'center'
                  }}
                >
                  Manage
                </Link>
                <button
                  onClick={() => handleEdit(course)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'white',
                    color: '#2ea67a',
                    border: '2px solid #2ea67a',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course.course_id)}
                  style={{
                    padding: '10px 16px',
                    background: 'white',
                    color: '#dc3545',
                    border: '2px solid #dc3545',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 32,
            maxWidth: 500,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
            
            {error && (
              <div style={{ padding: 12, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14,
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#2ea67a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Main app router with all page routes
import Home from '../pages/Home';
import CourseDetails from '../pages/CourseDetails';
import Profile from '../pages/Profile';
import CourseProgress from '../pages/CourseProgress';
import CourseReviews from '../pages/CourseReviews';
import QuizTaking from '../pages/QuizTaking';
import LessonViewer from '../pages/LessonViewer';
import Login from '../pages/Login';
import TeacherCourses from '../pages/TeacherCourses';
import TeacherCourseDetails from '../pages/TeacherCourseDetails';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AppRouter(){
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="card">Loading...</div>
      </div>
    );
  }

  // If not logged in, show only login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Teacher routes - separate from student routes
  if (user.role === 'teacher') {
    return (
      <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%'}}>
        <Header />
        <div className="container" style={{flex: '1 1 auto', width: '100%', maxWidth: '1600px'}}>
          <Routes>
            <Route path="/login" element={<Navigate to="/teacher/courses" replace />} />
            <Route path="/" element={<Navigate to="/teacher/courses" replace />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/courses/:courseId" element={<TeacherCourseDetails />} />
            <Route path="*" element={<Navigate to="/teacher/courses" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    );
  }

  // Student routes
  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%'}}>
      <Header />
      <div className="container" style={{flex: '1 1 auto', width: '100%', maxWidth: '1600px'}}>
        <Routes>
          <Route path="/login" element={<Navigate to={`/users/${user.userId}`} replace />} />
          <Route path="/" element={<Home/>} />
          <Route path="/courses" element={<Home/>} />
          <Route path="/courses/:id" element={<CourseDetails/>} />
          <Route path="/courses/:courseId/reviews" element={<CourseReviews/>} />
          <Route path="/users/:userId/courses/:courseId" element={<CourseProgress/>} />
          <Route path="/users/:userId/courses/:courseId/lessons/:lessonTitle" element={<LessonViewer/>} />
          <Route path="/users/:userId/courses/:courseId/quizzes/:quizId" element={<QuizTaking/>} />
          <Route path="/users/:userId" element={<Profile/>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from 'react';

// User profile page - display user info and enrolled courses
import { getUserProfile, updateUser, getUserEnrolledCourses, withdrawFromCourse } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';

export default function Profile(){
  // Manage user profile, premium status, and enrolled courses
  const { userId } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!userId) return;
    async function load(){
      try{
        setLoading(true);
        const [p, coursesRes] = await Promise.all([
          getUserProfile(userId),
          getUserEnrolledCourses(userId)
        ]);
        
        setProfile(p);
        // Set this user as the logged-in user in context
        setUser({ ...p, userId: Number(userId) });
        
        const coursesArray = Array.isArray(coursesRes) ? coursesRes : [];
        setCourses(coursesArray);
      }catch(e){
        console.error(e);
      }finally{
        setLoading(false);
      }
    }
    load();
  },[userId, setUser]);

  async function handleWithdraw(courseId, courseTitle) {
    if (!window.confirm(`Are you sure you want to withdraw from "${courseTitle}"? Your progress will be lost.`)) {
      return;
    }
    
    try {
      await withdrawFromCourse(userId, courseId);
      alert('Successfully withdrawn from the course');
      
      // Reload courses after withdrawal
      const coursesRes = await getUserEnrolledCourses(userId);
      const coursesArray = Array.isArray(coursesRes) ? coursesRes : [];
      setCourses(coursesArray);
    } catch (err) {
      console.error('Failed to withdraw from course', err);
      alert('Failed to withdraw from course: ' + (err.response?.data?.message || err.message));
    }
  }

  if(loading){
    return <div className="card">Loading...</div>;
  }

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '24px'}}>
      <h1 style={{marginBottom: '24px', fontSize: '32px', fontWeight: 600}}>My Profile</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px'}}>
        {/* Left Column - Profile Info */}
        <div>
          {!profile && <div className="card">Loading...</div>}
          {profile && (
            <>
              <div className="card" style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
                  <div style={{width:80,height:80,borderRadius:40,background:'var(--accent)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:'bold'}}>
                    {profile.username?.slice(0,1).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{margin:'0 0 4px 0'}}>{profile.username}</h3>
                    <p style={{margin:0,color:'#666'}}>{profile.email}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{marginTop:0}}>Account Information</h3>
                <div style={{display:'grid',gap:8}}>
                  <div style={{padding:8,background:'#f9f9f9',borderRadius:4}}>
                    <strong>User ID:</strong> {userId}
                  </div>
                  <div style={{padding:8,background:'#f9f9f9',borderRadius:4}}>
                    <strong>Username:</strong> {profile.username}
                  </div>
                  <div style={{padding:8,background:'#f9f9f9',borderRadius:4}}>
                    <strong>Email:</strong> {profile.email}
                  </div>
                  <div style={{padding:12,background:'#e8f5f0',borderRadius:4,border:'2px solid #2ea67a',marginTop:4}}>
                    <strong style={{color:'#16664d'}}>Total Points:</strong> <span style={{fontSize:20,fontWeight:700,color:'#2ea67a'}}>{profile.points || 0}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Enrolled Courses */}
        <div>
          <h2 style={{marginBottom: '16px', fontSize: '24px', fontWeight: 600}}>My Enrolled Courses</h2>
          
          {courses.length === 0 && (
            <div className="card">
              <p style={{margin: 0, color: '#666'}}>You have no enrolled courses yet.</p>
              <Link to="/" className="btn" style={{marginTop: 16, display: 'inline-block'}}>Browse Courses</Link>
            </div>
          )}

          <div style={{display: 'grid', gap: '16px'}}>
            {courses.map((c) => {
              const courseId = c.course_id || c.courseId || c.id;
              
              return (
                <div key={courseId} className="card" style={{padding: 0, overflow: 'hidden'}}>
                  <div style={{padding: '20px'}}>
                    <CourseCard 
                      course={c} 
                      actions={
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                          <Link 
                            to={`/users/${userId}/courses/${courseId}`} 
                            className="btn"
                            style={{textAlign: 'center'}}
                          >
                            Open Course
                          </Link>
                          <button
                            onClick={() => handleWithdraw(courseId, c.course_title || c.title)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Withdraw
                          </button>
                        </div>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

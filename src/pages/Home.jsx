import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// Home page - search & filter courses
import { searchCourses } from '../api/courses';
import { getCategoryCourses, getCategories } from '../api/categories';
import HomeBanner from '../components/HomeBanner';
import FiltersPanel from '../components/FiltersPanel';
import CourseCard from '../components/CourseCard';

export default function Home(){
  // State for courses, loading, search params, and filters
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [hasSearchOrFilters, setHasSearchOrFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});

  // Fetch courses with applied filters
  const load = async (filterParams = {}) => {
    setLoading(true);
    try{
      // Merge filter params with URL search params
      const params = { ...filterParams };
      
      // Check for keyword in URL params
      const keyword = searchParams.get('keyword');
      if(keyword) {
        params.keyword = keyword;
      }
      
      // Store current filters for reset
      setCurrentFilters(filterParams);
      
      let data;
      
      // If category filter is applied, use category endpoint
      if(params.category){
        data = await getCategoryCourses(params.category);
        
        // Apply keyword filter client-side if needed
        if(params.keyword){
          const searchTerm = params.keyword.toLowerCase();
          data = data.filter(course => {
            const titleMatch = (course.course_title || '').toLowerCase().includes(searchTerm);
            const descMatch = (course.course_description || '').toLowerCase().includes(searchTerm);
            return titleMatch || descMatch;
          });
        }
      } else {
        // Otherwise use regular search endpoint
        data = await searchCourses(params);
      }
      
      setCourses(Array.isArray(data) ? data : []);
      
      // Check if any search or filters are applied
      setHasSearchOrFilters(Object.keys(params).length > 0);
    }catch(e){
      console.error('Search error:', e);
      setCourses([]);
    }finally{
      setLoading(false);
    }
  }

  // Load courses on mount and when search params or filters change
  useEffect(()=>{
    load(currentFilters);
  },[searchParams]);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    }
    loadCategories();
  }, []);

  // Handle filter changes from sidebar
  const handleFilterApply = (filterParams) => {
    load(filterParams);
  };

  // Get display title
  const getDisplayTitle = () => {
    const keyword = searchParams.get('keyword');
    if (keyword) {
      return `Search Results for "${decodeURIComponent(keyword)}"`;
    }
    return 'Filtered Courses';
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      background: '#f5f5f5',
      padding: '24px 32px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Left Sidebar - Filters */}
        <div>
          <FiltersPanel onApply={handleFilterApply} categories={categories} />
        </div>

        {/* Main Content Area */}
        <div>
          {/* Show banner only when no search or filters are applied */}
          {!hasSearchOrFilters && <HomeBanner />}
          
          {/* Show course results when search or filters are applied */}
          {hasSearchOrFilters && (
            <div>
              <h2 style={{
                marginBottom: '20px',
                fontSize: '24px',
                fontWeight: 600,
                color: '#222'
              }}>
                {getDisplayTitle()}
              </h2>
              
              {loading && (
                <div style={{
                  background: 'white',
                  padding: '40px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  Loading courses...
                </div>
              )}
              
              {!loading && courses.length === 0 && (
                <div style={{
                  background: 'white',
                  padding: '40px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#666', margin: 0 }}>
                    No courses found. Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
              
              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {courses.map(c => (
                  <CourseCard 
                    key={c.courseId} 
                    course={c} 
                    actions={
                      <Link
                        to={`/courses/${c.course_id}`}
                        style={{
                          padding: '10px 20px',
                          background: '#2ea67a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          textAlign: 'center',
                          display: 'block'
                        }}
                      >
                        View Details
                      </Link>
                    } 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

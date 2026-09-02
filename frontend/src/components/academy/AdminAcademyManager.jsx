import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  SlidersHorizontal,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Video,
  Eye,
  Filter,
  RefreshCw,
  X,
  FileText,
  Lock
} from 'lucide-react';

const API_BASE = "http://localhost:8089/api";

export default function AdminAcademyManager({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'courses', 'enrollments', 'analytics'
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Course Editing / Creating state
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'Communication',
    level: 'Beginner',
    duration: '6 hours',
    isFree: false,
    price: 1500,
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop',
    whatYouWillLearn: ''
  });

  // Module / Lesson Editor State
  const [managingLessonsCourse, setManagingLessonsCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    moduleTitle: 'Module 1 — Introduction',
    lessonTitle: '',
    description: '',
    youtubeVideoId: 'dQw4w9WgXcQ',
    duration: '12:00',
    lessonOrder: 1,
    isFreePreview: false
  });

  // Enrollment Filters
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('ALL');
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState('ALL');

  // Student Profile Modal
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);

  useEffect(() => {
    fetchAdminAcademyData();
  }, []);

  const fetchAdminAcademyData = async () => {
    setLoading(true);
    try {
      const resC = await fetch(`${API_BASE}/training/courses`);
      if (resC.ok) setCourses(await resC.json());

      const resE = await fetch(`${API_BASE}/training/enrollments/all`);
      if (resE.ok) setEnrollments(await resE.json());

      const resA = await fetch(`${API_BASE}/training/analytics`);
      if (resA.ok) setAnalytics(await resA.json());
    } catch (e) {
      console.error("Failed to load admin academy data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const res = await fetch(`${API_BASE}/training/courses/${courseId}/lessons`);
      if (res.ok) {
        const data = await res.json();
        setCourseLessons(data);
      }
    } catch (e) {
      console.error("Failed to fetch lessons", e);
    }
  };

  // Create or Update Course
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `${API_BASE}/training/courses/${editingCourse.id}` : `${API_BASE}/training/courses`;
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });

      if (res.ok) {
        setShowCourseModal(false);
        setEditingCourse(null);
        fetchAdminAcademyData();
        if (onShowToast) onShowToast("Course Saved!", `Course "${courseForm.title}" saved successfully.`, "success");
      }
    } catch (err) {
      console.error("Save course failed", err);
    }
  };

  const handleEditCourseClick = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      instructor: course.instructor || '',
      category: course.category || 'Communication',
      level: course.level || 'Beginner',
      duration: course.duration || '6 hours',
      isFree: !!course.isFree,
      price: course.price || 0,
      image: course.image || '',
      whatYouWillLearn: course.whatYouWillLearn || ''
    });
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course and all its lessons?")) return;
    try {
      const res = await fetch(`${API_BASE}/training/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminAcademyData();
        if (onShowToast) onShowToast("Course Deleted", "Course deleted from platform.", "success");
      }
    } catch (e) {
      console.error("Delete course error", e);
    }
  };

  // Open Lesson Manager
  const handleOpenLessonManager = (course) => {
    setManagingLessonsCourse(course);
    fetchLessons(course.id);
    setEditingLesson(null);
    setLessonForm({
      moduleTitle: 'Module 1 — Introduction',
      lessonTitle: '',
      description: '',
      youtubeVideoId: 'dQw4w9WgXcQ',
      duration: '12:00',
      lessonOrder: (courseLessons.length || 0) + 1,
      isFreePreview: false
    });
  };

  // Save Lesson (Add or Edit)
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!managingLessonsCourse) return;

    try {
      const url = editingLesson ? `${API_BASE}/training/lessons/${editingLesson.id}` : `${API_BASE}/training/courses/${managingLessonsCourse.id}/lessons`;
      const method = editingLesson ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm)
      });

      if (res.ok) {
        fetchLessons(managingLessonsCourse.id);
        fetchAdminAcademyData();
        setEditingLesson(null);
        setLessonForm({
          moduleTitle: 'Module 1 — Introduction',
          lessonTitle: '',
          description: '',
          youtubeVideoId: 'dQw4w9WgXcQ',
          duration: '12:00',
          lessonOrder: courseLessons.length + 2,
          isFreePreview: false
        });
        if (onShowToast) onShowToast("Lesson Saved!", "Course lesson saved successfully.", "success");
      }
    } catch (err) {
      console.error("Save lesson error", err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const res = await fetch(`${API_BASE}/training/lessons/${lessonId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLessons(managingLessonsCourse.id);
        fetchAdminAcademyData();
      }
    } catch (e) {
      console.error("Delete lesson error", e);
    }
  };

  // Fetch Student Academy Profile Modal
  const handleViewStudentProfile = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/training/user-profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStudentProfile(data);
      }
    } catch (e) {
      console.error("Fetch student profile error", e);
    }
  };

  // Update Enrollment Payment Status
  const handleUpdateEnrollmentStatus = async (enrollmentId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/training/enrollments/${enrollmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      if (res.ok) {
        fetchAdminAcademyData();
        if (onShowToast) onShowToast("Status Updated", `Enrollment status changed to ${newStatus}`, "success");
      }
    } catch (e) {
      console.error("Update status error", e);
    }
  };

  // Filtered Enrollments List
  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = (e.transactionId || '').toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
                          String(e.userId).includes(enrollmentSearch) ||
                          String(e.courseId).includes(enrollmentSearch);
    const matchesStatus = enrollmentStatusFilter === 'ALL' || (e.paymentStatus || '').toUpperCase() === enrollmentStatusFilter;
    const matchesType = enrollmentTypeFilter === 'ALL' ||
                        (enrollmentTypeFilter === 'FREE' && e.paymentStatus === 'FREE') ||
                        (enrollmentTypeFilter === 'PAID' && e.paymentStatus !== 'FREE');
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-primary)' }}>
      
      {/* Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={32} color="#f59e0b" />
            Academy Management Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage course catalog, YouTube video lessons, student enrollments, payment verification, and learning analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#0e1526', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('overview')}>
            <BarChart3 size={15} /> Overview
          </button>
          <button className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('courses')}>
            <BookOpen size={15} /> Courses ({courses.length})
          </button>
          <button className={`btn ${activeTab === 'enrollments' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('enrollments')}>
            <Users size={15} /> Enrollments ({enrollments.length})
          </button>
          <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('analytics')}>
            <TrendingUp size={15} /> Analytics
          </button>
        </div>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Courses</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{analytics?.totalCourses || courses.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                {analytics?.freeCourses || 0} Free • {analytics?.paidCourses || 0} Paid
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Enrollments</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{analytics?.totalEnrollments || enrollments.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Across all student accounts</div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Learners</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>{analytics?.activeLearners || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Currently in progress</div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Revenue</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>৳{(analytics?.totalRevenue || 0).toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Verified course payments</div>
            </div>

          </div>

          {/* Recent Enrollments Quick List */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Recent Student Enrollments</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {enrollments.slice(0, 5).map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>User ID: #{e.userId}</strong> • Course #{e.courseId}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Payment: {e.paymentMethod} • TxID: {e.transactionId}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-verified" style={{ background: e.paymentStatus === 'SUCCESSFUL' ? '#10b981' : e.paymentStatus === 'FREE' ? '#3b82f6' : '#f59e0b' }}>
                      {e.paymentStatus}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Progress: {e.progressPercentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- COURSES CRUD TAB --- */}
      {activeTab === 'courses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Course Catalog ({courses.length})</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({
                  title: '',
                  description: '',
                  instructor: '',
                  category: 'Communication',
                  level: 'Beginner',
                  duration: '6 hours',
                  isFree: false,
                  price: 1500,
                  image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop',
                  whatYouWillLearn: ''
                });
                setShowCourseModal(true);
              }}
            >
              <Plus size={16} /> Create New Course
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {courses.map(course => (
              <div key={course.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '160px', background: '#1e293b' }}>
                  <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span className="badge badge-gold">{course.category}</span>
                  </div>
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span className="badge badge-verified" style={{ background: course.isFree ? '#10b981' : '#3b82f6' }}>
                      {course.isFree ? 'FREE' : `৳${course.price}`}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Instructor: <strong>{course.instructor}</strong> • {course.lessonsCount || 0} Lessons • Rating: ⭐ {course.rating}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => handleOpenLessonManager(course)}>
                        <Video size={14} /> Manage Lessons
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleEditCourseClick(course)}>
                        <Edit3 size={15} color="var(--primary)" />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 size={15} color="var(--accent-rose)" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ENROLLMENTS MANAGEMENT TAB --- */}
      {activeTab === 'enrollments' && (
        <div>
          {/* Search & Filter Bar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                  placeholder="Search student ID, course ID, or transaction..."
                  value={enrollmentSearch}
                  onChange={e => setEnrollmentSearch(e.target.value)}
                />
              </div>

              <select className="form-select" style={{ width: '160px', fontSize: '0.85rem' }} value={enrollmentStatusFilter} onChange={e => setEnrollmentStatusFilter(e.target.value)}>
                <option value="ALL">All Payment States</option>
                <option value="FREE">Free</option>
                <option value="SUCCESSFUL">Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>

              <select className="form-select" style={{ width: '160px', fontSize: '0.85rem' }} value={enrollmentTypeFilter} onChange={e => setEnrollmentTypeFilter(e.target.value)}>
                <option value="ALL">All Types</option>
                <option value="FREE">Free Courses</option>
                <option value="PAID">Paid Courses</option>
              </select>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#0e1526', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.8rem 1rem' }}>Student User ID</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Course ID</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Payment Method</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Transaction ID</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Progress</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleViewStudentProfile(e.userId)}>
                        👤 User #{e.userId}
                      </button>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold' }}>Course #{e.courseId}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>{e.paymentMethod || 'NONE'}</td>
                    <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace' }}>{e.transactionId}</td>
                    <td style={{ padding: '0.8rem 1rem', color: 'var(--accent-gold)' }}>
                      {e.amountPaid ? `৳${e.amountPaid}` : 'Free'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${e.progressPercentage}%`, background: 'var(--primary)', height: '100%' }}></div>
                        </div>
                        <span>{e.progressPercentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <select
                        className="form-select"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', background: '#0e1526' }}
                        value={e.paymentStatus}
                        onChange={ev => handleUpdateEnrollmentStatus(e.id, ev.target.value)}
                      >
                        <option value="FREE">FREE</option>
                        <option value="SUCCESSFUL">SUCCESSFUL</option>
                        <option value="PENDING">PENDING</option>
                        <option value="FAILED">FAILED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleViewStudentProfile(e.userId)}>
                        View Activity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- COURSE ANALYTICS TAB --- */}
      {activeTab === 'analytics' && (
        <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Course Performance & Revenue Analytics</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0e1526', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem 1rem' }}>Course Title</th>
                <th style={{ padding: '0.8rem 1rem' }}>Category</th>
                <th style={{ padding: '0.8rem 1rem' }}>Total Enrollments</th>
                <th style={{ padding: '0.8rem 1rem' }}>Active Learners</th>
                <th style={{ padding: '0.8rem 1rem' }}>Completed</th>
                <th style={{ padding: '0.8rem 1rem' }}>Completion Rate</th>
                <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.courseStats || []).map((stat, sIdx) => (
                <tr key={sIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold' }}>{stat.title}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>{stat.category}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>{stat.enrollments}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>{stat.active}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>{stat.completed}</td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{stat.completionRate}%</td>
                  <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                    ৳{(stat.revenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- CREATE / EDIT COURSE MODAL --- */}
      {showCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
              <button className="btn-icon" onClick={() => setShowCourseModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCourse}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Course Title</label>
                  <input className="form-input" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Instructor</label>
                  <input className="form-input" value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-select" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}>
                    <option value="Communication">Communication</option>
                    <option value="HVAC & AC">HVAC & AC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Safety">Safety</option>
                    <option value="Smart Home">Smart Home</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Level</label>
                  <select className="form-select" value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Duration</label>
                  <input className="form-input" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="e.g. 6 hours" required />
                </div>
                <div>
                  <label className="form-label">Is Free Course?</label>
                  <select className="form-select" value={courseForm.isFree ? 'true' : 'false'} onChange={e => setCourseForm({ ...courseForm, isFree: e.target.value === 'true' })}>
                    <option value="false">Paid Course</option>
                    <option value="true">Free Course</option>
                  </select>
                </div>
                {!courseForm.isFree && (
                  <div>
                    <label className="form-label">Course Price (BDT ৳)</label>
                    <input type="number" className="form-input" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: Number(e.target.value) })} required />
                  </div>
                )}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Thumbnail Image URL</label>
                  <input className="form-input" value={courseForm.image} onChange={e => setCourseForm({ ...courseForm, image: e.target.value })} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows="2" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">What You Will Learn (Newline-separated list)</label>
                  <textarea className="form-textarea" rows="3" placeholder="✓ Point 1&#10;✓ Point 2" value={courseForm.whatYouWillLearn} onChange={e => setCourseForm({ ...courseForm, whatYouWillLearn: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MANAGE LESSONS MODAL --- */}
      {managingLessonsCourse && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>Manage Lessons: {managingLessonsCourse.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>YouTube Video Integration Editor</div>
              </div>
              <button className="btn-icon" onClick={() => setManagingLessonsCourse(null)}><X size={18} /></button>
            </div>

            {/* Lesson Add/Edit Form */}
            <form onSubmit={handleSaveLesson} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.8rem' }}>
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <label className="form-label">Module Title</label>
                  <input className="form-input" value={lessonForm.moduleTitle} onChange={e => setLessonForm({ ...lessonForm, moduleTitle: e.target.value })} placeholder="Module 1 — Introduction" required />
                </div>
                <div>
                  <label className="form-label">Lesson Title</label>
                  <input className="form-input" value={lessonForm.lessonTitle} onChange={e => setLessonForm({ ...lessonForm, lessonTitle: e.target.value })} placeholder="Lesson 1: Basics" required />
                </div>
                <div>
                  <label className="form-label">YouTube Video ID / URL</label>
                  <input className="form-input" value={lessonForm.youtubeVideoId} onChange={e => setLessonForm({ ...lessonForm, youtubeVideoId: e.target.value })} placeholder="dQw4w9WgXcQ" required />
                </div>
                <div>
                  <label className="form-label">Duration</label>
                  <input className="form-input" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} placeholder="12:45" required />
                </div>
                <div>
                  <label className="form-label">Lesson Order #</label>
                  <input type="number" className="form-input" value={lessonForm.lessonOrder} onChange={e => setLessonForm({ ...lessonForm, lessonOrder: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="form-label">Is Free Preview?</label>
                  <select className="form-select" value={lessonForm.isFreePreview ? 'true' : 'false'} onChange={e => setLessonForm({ ...lessonForm, isFreePreview: e.target.value === 'true' })}>
                    <option value="false">Locked (Requires Enrollment)</option>
                    <option value="true">Free Preview Allowed</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Lesson Description</label>
                  <textarea className="form-textarea" rows="2" value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Short summary..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {editingLesson && <button type="button" className="btn btn-secondary" onClick={() => setEditingLesson(null)}>Cancel Edit</button>}
                <button type="submit" className="btn btn-primary">{editingLesson ? 'Update Lesson' : 'Add Lesson'}</button>
              </div>
            </form>

            {/* Current Lessons List */}
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
              Published Lessons ({courseLessons.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
              {courseLessons.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>#{l.lessonOrder} — {l.lessonTitle}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Module: {l.moduleTitle} • YouTube ID: <code style={{ color: 'var(--primary)' }}>{l.youtubeVideoId}</code> • {l.duration}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem' }} onClick={() => {
                      setEditingLesson(l);
                      setLessonForm({
                        moduleTitle: l.moduleTitle,
                        lessonTitle: l.lessonTitle,
                        description: l.description || '',
                        youtubeVideoId: l.youtubeVideoId,
                        duration: l.duration,
                        lessonOrder: l.lessonOrder,
                        isFreePreview: !!l.isFreePreview
                      });
                    }}>
                      <Edit3 size={14} color="var(--primary)" />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem' }} onClick={() => handleDeleteLesson(l.id)}>
                      <Trash2 size={14} color="var(--accent-rose)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- STUDENT PROFILE ACTIVITY MODAL --- */}
      {selectedStudentProfile && (
        <div className="modal-overlay" onClick={() => setSelectedStudentProfile(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Student Academy Profile: User #{selectedStudentProfile.userId}</h3>
              <button className="btn-icon" onClick={() => setSelectedStudentProfile(null)}><X size={18} /></button>
            </div>

            {/* Profile Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Courses Enrolled</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedStudentProfile.coursesEnrolled}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Completed</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{selectedStudentProfile.coursesCompleted}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Total Spent</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>৳{(selectedStudentProfile.totalAmountSpent || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Enrolled Courses List */}
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.6rem' }}>Enrolled Courses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
              {(selectedStudentProfile.enrollments || []).map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <div>
                    <strong>Course #{e.courseId}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TxID: {e.transactionId} • Method: {e.paymentMethod}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-verified" style={{ background: e.paymentStatus === 'SUCCESSFUL' ? '#10b981' : '#3b82f6' }}>{e.paymentStatus}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Progress: {e.progressPercentage}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedStudentProfile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

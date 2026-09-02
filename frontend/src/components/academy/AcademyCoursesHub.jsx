import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Award,
  Clock,
  User,
  CheckCircle2,
  Lock,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Download,
  Sparkles,
  Zap,
  Check,
  X,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const API_BASE = "http://localhost:8089/api";

export default function AcademyCoursesHub({ currentUser, onShowToast }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Landing page state
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'my-courses'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, popular, rating, free, paid, beginner, intermediate, advanced

  // Detail Modal / Studio state
  const [viewingCourse, setViewingCourse] = useState(null); // Course object
  const [courseLessons, setCourseLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isStudioMode, setIsStudioMode] = useState(false);

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingCourse, setPayingCourse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BKASH'); // BKASH, NAGAD, ROCKET, CARD, INTERNET_BANKING
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paymentPin, setPaymentPin] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentState, setPaymentState] = useState('IDLE'); // IDLE, PROCESSING, SUCCESSFUL, FAILED

  // Certificate Modal state
  const [certificateData, setCertificateData] = useState(null);

  const CATEGORIES = ['All', 'Communication', 'HVAC & AC', 'Electrical', 'Plumbing', 'Safety', 'Smart Home'];

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, [currentUser?.id]);

  const fetchCoursesAndEnrollments = async () => {
    setLoading(true);
    try {
      const resCourses = await fetch(`${API_BASE}/training/courses`);
      if (resCourses.ok) {
        const dataCourses = await resCourses.json();
        setCourses(dataCourses);
      }

      if (currentUser?.id) {
        const resEnroll = await fetch(`${API_BASE}/training/enrollments/user/${currentUser.id}`);
        if (resEnroll.ok) {
          const dataEnroll = await resEnroll.json();
          setEnrollments(dataEnroll);
        }
      }
    } catch (err) {
      console.error("Failed to load academy data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsForCourse = async (courseId, courseTitle = '') => {
    try {
      const res = await fetch(`${API_BASE}/training/courses/${courseId}/lessons`);
      if (res.ok) {
        let data = await res.json();
        if (!data || data.length === 0) {
          // Sample fallback lesson so no course is ever empty
          data = [
            {
              id: 99901 + Number(courseId),
              courseId: courseId,
              moduleTitle: "Module 1 — Fundamental Concepts & Overview",
              lessonTitle: `Lesson 1: Introduction to ${courseTitle || 'Mastery Skills'}`,
              description: "Comprehensive introduction covering safety standards, core tools, and step-by-step practical demonstration.",
              youtubeVideoId: "dQw4w9WgXcQ",
              duration: "12:45",
              lessonOrder: 1,
              isFreePreview: true
            },
            {
              id: 99902 + Number(courseId),
              courseId: courseId,
              moduleTitle: "Module 2 — Advanced Practical Execution",
              lessonTitle: "Lesson 2: Practical Field Application & Best Practices",
              description: "Deep dive into real-world service troubleshooting, fault diagnostics, and customer satisfaction tips.",
              youtubeVideoId: "dQw4w9WgXcQ",
              duration: "18:20",
              lessonOrder: 2,
              isFreePreview: false
            }
          ];
        }
        setCourseLessons(data);
        return data;
      }
    } catch (e) {
      console.error("Error fetching lessons", e);
    }
    const fallbackData = [
      {
        id: 99901 + Number(courseId),
        courseId: courseId,
        moduleTitle: "Module 1 — Fundamental Concepts & Overview",
        lessonTitle: `Lesson 1: Introduction to ${courseTitle || 'Mastery Skills'}`,
        description: "Comprehensive introduction covering safety standards, core tools, and step-by-step practical demonstration.",
        youtubeVideoId: "dQw4w9WgXcQ",
        duration: "12:45",
        lessonOrder: 1,
        isFreePreview: true
      }
    ];
    setCourseLessons(fallbackData);
    return fallbackData;
  };

  // Open Course Details
  const handleOpenCourseDetails = async (course) => {
    setViewingCourse(course);
    const lessons = await fetchLessonsForCourse(course.id, course.title);
    if (lessons.length > 0) {
      setActiveLesson(lessons[0]);
    }
  };

  // Open Studio Learning Interface
  const handleStartLearning = async (course) => {
    setViewingCourse(course);
    const lessons = await fetchLessonsForCourse(course.id, course.title);
    
    // Find current active lesson from user enrollment lastWatchedLessonId
    const userEnrollment = enrollments.find(e => e.courseId === course.id);
    if (userEnrollment && userEnrollment.lastWatchedLessonId) {
      const last = lessons.find(l => l.id === userEnrollment.lastWatchedLessonId);
      if (last) setActiveLesson(last);
      else setActiveLesson(lessons[0]);
    } else if (lessons.length > 0) {
      setActiveLesson(lessons[0]);
    }

    setIsStudioMode(true);
  };

  // Free Course Enrollment
  const handleFreeEnrollment = async (course) => {
    if (!currentUser?.id) {
      alert("Please log in to enroll in courses.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/training/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          courseId: course.id,
          paymentStatus: 'FREE',
          paymentMethod: 'NONE',
          transactionId: `TXN-FREE-${Date.now()}`,
          amountPaid: 0.0
        })
      });

      if (res.ok) {
        const newEnrollment = await res.json();
        setEnrollments(prev => [...prev.filter(e => e.courseId !== course.id), newEnrollment]);
        if (onShowToast) {
          onShowToast("Enrolled Successfully!", `🎉 You have enrolled in "${course.title}". Start learning now!`, "success");
        } else {
          alert(`Successfully enrolled in ${course.title}!`);
        }
        handleStartLearning(course);
      }
    } catch (err) {
      console.error("Enrollment failed", err);
    }
  };

  // Paid Course Enrollment Start
  const handleStartPaidEnrollment = (course) => {
    if (!currentUser?.id) {
      alert("Please log in to enroll in courses.");
      return;
    }
    setPayingCourse(course);
    setPaymentState('IDLE');
    setPaymentAccount('');
    setPaymentPin('');
    setShowPaymentModal(true);
  };

  // Execute Mock Bangladesh Payment & Activation
  const handleProcessPayment = async () => {
    if (!paymentAccount || paymentAccount.length < 8) {
      alert("Please enter a valid mobile wallet or bank account number!");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentState('PROCESSING');

    // Simulate backend payment gateway response delay
    setTimeout(async () => {
      try {
        const txId = `${paymentMethod}-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const res = await fetch(`${API_BASE}/training/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            courseId: payingCourse.id,
            paymentStatus: 'SUCCESSFUL',
            paymentMethod: paymentMethod,
            transactionId: txId,
            amountPaid: payingCourse.price
          })
        });

        if (res.ok) {
          const newEnrollment = await res.json();
          setEnrollments(prev => [...prev.filter(e => e.courseId !== payingCourse.id), newEnrollment]);
          setPaymentState('SUCCESSFUL');
          setIsProcessingPayment(false);

          setTimeout(() => {
            setShowPaymentModal(false);
            if (onShowToast) {
              onShowToast("Payment Confirmed!", `🎉 Payment of ৳${payingCourse.price} verified via ${paymentMethod}.\nTxID: ${txId}`, "success");
            }
            handleStartLearning(payingCourse);
          }, 1200);
        } else {
          setPaymentState('FAILED');
          setIsProcessingPayment(false);
        }
      } catch (err) {
        console.error("Payment error", err);
        setPaymentState('FAILED');
        setIsProcessingPayment(false);
      }
    }, 1500);
  };

  // Toggle Lesson Completion in Learning Studio
  const handleToggleLessonComplete = async (lessonId) => {
    if (!viewingCourse || !currentUser?.id) return;

    const userEnrollment = enrollments.find(e => e.courseId === viewingCourse.id);
    if (!userEnrollment) return;

    // Parse existing completed lesson IDs string e.g. "1,2,5"
    let completedSet = new Set(
      userEnrollment.completedLessonIds ? userEnrollment.completedLessonIds.split(',').filter(Boolean).map(Number) : []
    );

    if (completedSet.has(lessonId)) {
      completedSet.delete(lessonId);
    } else {
      completedSet.add(lessonId);
    }

    const updatedIdsStr = Array.from(completedSet).join(',');
    const newCompletedCount = completedSet.size;
    const totalLessons = courseLessons.length || viewingCourse.lessonsCount || 1;
    const newProgress = Math.min(100, Math.round((newCompletedCount / totalLessons) * 100));
    const isNowCompleted = newProgress === 100;

    // Optimistic UI update
    setEnrollments(prev => prev.map(e => {
      if (e.id === userEnrollment.id) {
        return {
          ...e,
          completedLessonIds: updatedIdsStr,
          completedLessonsCount: newCompletedCount,
          progressPercentage: newProgress,
          lastWatchedLessonId: lessonId,
          isCompleted: isNowCompleted
        };
      }
      return e;
    }));

    try {
      await fetch(`${API_BASE}/training/enrollments/${userEnrollment.id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedCount: newCompletedCount,
          progressPercentage: newProgress,
          lastWatchedLessonId: lessonId,
          completedLessonIds: updatedIdsStr,
          isCompleted: isNowCompleted
        })
      });

      if (isNowCompleted && onShowToast) {
        onShowToast("Course Completed! 🎉", `Congratulations! You have completed all lessons for "${viewingCourse.title}". Your certificate is ready!`, "success");
      }
    } catch (e) {
      console.error("Failed to sync progress to backend", e);
    }
  };

  // Filter & Sort Logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.instructor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
    if (sortBy === 'popular') return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'free') return (a.isFree ? -1 : 1);
    if (sortBy === 'paid') return (!a.isFree ? -1 : 1);
    if (sortBy === 'beginner') return (a.level === 'Beginner' ? -1 : 1);
    if (sortBy === 'intermediate') return (a.level === 'Intermediate' ? -1 : 1);
    if (sortBy === 'advanced') return (a.level === 'Advanced' ? -1 : 1);
    return 0;
  });

  const enrolledCourseObjects = enrollments.map(enrollment => {
    const foundCourse = courses.find(c => c.id === enrollment.courseId);
    return {
      enrollment,
      course: foundCourse
    };
  }).filter(item => item.course !== undefined);

  // Helper check for enrollment status
  const getEnrollmentForCourse = (courseId) => {
    return enrollments.find(e => e.courseId === courseId && (e.paymentStatus === 'SUCCESSFUL' || e.paymentStatus === 'FREE'));
  };

  // Generate YouTube Embed URL cleanly
  const getYouTubeEmbedUrl = (videoId) => {
    if (!videoId) return "https://www.youtube.com/embed/dQw4w9WgXcQ";
    // Handle full URL or plain ID
    let cleanId = videoId;
    if (videoId.includes('v=')) {
      cleanId = videoId.split('v=')[1].split('&')[0];
    } else if (videoId.includes('youtu.be/')) {
      cleanId = videoId.split('youtu.be/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${cleanId}?rel=0&autoplay=0`;
  };

  return (
    <div style={{ minHeight: '85vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', paddingBottom: '3rem' }}>
      
      {/* --- STUDIO MODE LEARNING INTERFACE --- */}
      {isStudioMode && viewingCourse && (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Studio Top Navigation Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#0e1526', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                onClick={() => {
                  setIsStudioMode(false);
                  setViewingCourse(null);
                }}
              >
                <ArrowLeft size={16} /> Exit Studio
              </button>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {viewingCourse.category} • Studio Mode
                </div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{viewingCourse.title}</h2>
              </div>
            </div>

            {/* Progress & Certificate Button */}
            {(() => {
              const userEnrollment = getEnrollmentForCourse(viewingCourse.id);
              const progress = userEnrollment ? userEnrollment.progressPercentage : 0;
              const isCompleted = userEnrollment ? userEnrollment.isCompleted : false;

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Overall Progress: <strong style={{ color: 'var(--primary)' }}>{progress}%</strong>
                    </div>
                    <div style={{ width: '140px', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>

                  {isCompleted && (
                    <button
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', fontWeight: 'bold' }}
                      onClick={() => setCertificateData({
                        user: currentUser,
                        course: viewingCourse,
                        enrollment: userEnrollment
                      })}
                    >
                      <Award size={16} /> Download Certificate
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Main Studio Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
            
            {/* LEFT SIDE: Curriculum & Lessons List Sidebar */}
            <div className="glass-card" style={{ height: 'fit-content', maxHeight: '780px', overflowY: 'auto', padding: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--primary)" /> Course Curriculum
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {(() => {
                  const userEnrollment = getEnrollmentForCourse(viewingCourse.id);
                  const completedSet = new Set(
                    userEnrollment && userEnrollment.completedLessonIds ? userEnrollment.completedLessonIds.split(',').filter(Boolean).map(Number) : []
                  );

                  // Group lessons by moduleTitle
                  const modulesMap = {};
                  courseLessons.forEach(l => {
                    const modName = l.moduleTitle || 'Module 1 — Core Content';
                    if (!modulesMap[modName]) modulesMap[modName] = [];
                    modulesMap[modName].push(l);
                  });

                  return Object.keys(modulesMap).map((modName, mIdx) => (
                    <div key={mIdx}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                        {modName}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {modulesMap[modName].map(lesson => {
                          const isActive = activeLesson && activeLesson.id === lesson.id;
                          const isDone = completedSet.has(lesson.id);

                          return (
                            <div
                              key={lesson.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.6rem 0.8rem',
                                borderRadius: '8px',
                                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                                border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => setActiveLesson(lesson)}
                            >
                              <div style={{ color: isDone ? 'var(--primary)' : 'var(--text-muted)' }}>
                                {isDone ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'var(--primary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lesson.lessonTitle}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Clock size={11} /> {lesson.duration || '12:00'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* RIGHT SIDE: YouTube Video Player & Content */}
            <div>
              {activeLesson ? (
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  
                  {/* YouTube Video Player Container */}
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(activeLesson.youtubeVideoId)}
                      title={activeLesson.lessonTitle}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* Lesson Information & Actions */}
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                          {activeLesson.moduleTitle}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', margin: '0.2rem 0' }}>{activeLesson.lessonTitle}</h2>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} /> Duration: {activeLesson.duration}
                        </div>
                      </div>

                      {/* Lesson Toggle Complete Button */}
                      {(() => {
                        const userEnrollment = getEnrollmentForCourse(viewingCourse.id);
                        const completedSet = new Set(
                          userEnrollment && userEnrollment.completedLessonIds ? userEnrollment.completedLessonIds.split(',').filter(Boolean).map(Number) : []
                        );
                        const isDone = completedSet.has(activeLesson.id);

                        return (
                          <button
                            className={`btn ${isDone ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ background: isDone ? 'var(--primary)' : 'rgba(255,255,255,0.05)' }}
                            onClick={() => handleToggleLessonComplete(activeLesson.id)}
                          >
                            <CheckCircle2 size={18} /> {isDone ? 'Lesson Completed ✓' : 'Mark as Completed'}
                          </button>
                        );
                      })()}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                      {activeLesson.description || "In this lesson, you will learn practical steps, industry best practices, and actionable guidelines for technician safety and client satisfaction."}
                    </p>

                    {/* Navigation Buttons (Previous / Next Lesson) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      {(() => {
                        const currentIndex = courseLessons.findIndex(l => l.id === activeLesson.id);
                        const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
                        const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

                        return (
                          <>
                            <button
                              className="btn btn-secondary"
                              disabled={!prevLesson}
                              onClick={() => prevLesson && setActiveLesson(prevLesson)}
                              style={{ opacity: prevLesson ? 1 : 0.4 }}
                            >
                              <ArrowLeft size={16} /> Previous Lesson
                            </button>
                            <button
                              className="btn btn-primary"
                              disabled={!nextLesson}
                              onClick={() => nextLesson && setActiveLesson(nextLesson)}
                              style={{ opacity: nextLesson ? 1 : 0.4 }}
                            >
                              Next Lesson <ArrowRight size={16} />
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <PlayCircle size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <div>Select a lesson from the curriculum sidebar to start watching.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NORMAL LANDING & MY COURSES VIEWS --- */}
      {!isStudioMode && (
        <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
          
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={32} color="var(--primary)" />
                Academy & Courses
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '0.3rem' }}>
                Master essential technical, electrical, HVAC, and client communication skills. Earn certificates and advance your career with video courses taught by industry certified experts.
              </p>
            </div>

            {/* Sub-Tab Navigation Switcher */}
            <div style={{ display: 'flex', background: '#0e1526', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                onClick={() => setActiveTab('browse')}
              >
                <Search size={16} /> Browse Courses
              </button>
              <button
                className={`btn ${activeTab === 'my-courses' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                onClick={() => setActiveTab('my-courses')}
              >
                <Award size={16} /> My Courses ({enrolledCourseObjects.length})
              </button>
            </div>
          </div>

          {/* BROWSE COURSES LANDING TAB */}
          {activeTab === 'browse' && (
            <>
              {/* Search, Filter & Sort Control Bar */}
              <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  
                  {/* Search Input */}
                  <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Search courses, instructors, topics..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Sorting Selector */}
                  <div style={{ minWidth: '180px' }}>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="newest">Sort: Newest</option>
                      <option value="popular">Sort: Most Popular</option>
                      <option value="rating">Sort: Highest Rated</option>
                      <option value="free">Sort: Free Courses First</option>
                      <option value="paid">Sort: Paid Courses First</option>
                      <option value="beginner">Sort: Beginner Level</option>
                      <option value="intermediate">Sort: Intermediate Level</option>
                      <option value="advanced">Sort: Advanced Level</option>
                    </select>
                  </div>
                </div>

                {/* Category Chips */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderRadius: '20px' }}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Cards Grid */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <Clock size={36} className="animate-spin" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <div>Loading academy courses...</div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                  <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3>No courses found</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Try adjusting your search query or category filters.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.8rem' }}>
                  {filteredCourses.map(course => {
                    const userEnrollment = getEnrollmentForCourse(course.id);
                    const isEnrolled = !!userEnrollment;

                    return (
                      <div key={course.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease' }}>
                        
                        {/* Course Thumbnail */}
                        <div style={{ position: 'relative', height: '180px', background: '#1e293b' }}>
                          <img
                            src={course.image || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600'}
                            alt={course.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.4rem' }}>
                            <span className="badge badge-gold" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {course.level || 'Beginner'}
                            </span>
                            <span className="badge badge-verified" style={{ background: course.isFree ? '#10b981' : '#3b82f6', color: '#fff', fontSize: '0.75rem' }}>
                              {course.isFree ? 'FREE' : `৳${course.price?.toLocaleString()}`}
                            </span>
                          </div>

                          {isEnrolled && (
                            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(16, 185, 129, 0.95)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={13} /> Enrolled ({userEnrollment.progressPercentage}%)
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                              {course.category}
                            </div>
                            <h3 style={{ fontSize: '1.15rem', lineHeight: '1.3', marginBottom: '0.5rem' }}>{course.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                              {course.description}
                            </p>
                          </div>

                          <div>
                            {/* Meta info stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <div><strong>Instructor:</strong> {course.instructor}</div>
                              <div><strong>Duration:</strong> {course.duration}</div>
                              <div><strong>Lessons:</strong> {course.lessonsCount} Lessons</div>
                              <div><strong>Students:</strong> {(course.enrollmentCount || 120).toLocaleString()} enrolled</div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                                onClick={() => handleOpenCourseDetails(course)}
                              >
                                View Details
                              </button>

                              {isEnrolled ? (
                                <button
                                  className="btn btn-primary"
                                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                                  onClick={() => handleStartLearning(course)}
                                >
                                  Continue Learning
                                </button>
                              ) : course.isFree ? (
                                <button
                                  className="btn btn-primary"
                                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                                  onClick={() => handleFreeEnrollment(course)}
                                >
                                  Enroll Free
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary"
                                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                                  onClick={() => handleStartPaidEnrollment(course)}
                                >
                                  Enroll — ৳{course.price}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* MY COURSES TAB */}
          {activeTab === 'my-courses' && (
            <div>
              {enrolledCourseObjects.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                  <Award size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                  <h3>You haven't enrolled in any courses yet</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Browse our full catalog of expert-led courses to upgrade your technical skills and earn certificates.
                  </p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('browse')}>
                    <Search size={16} /> Browse Course Catalog
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.8rem' }}>
                  {enrolledCourseObjects.map(({ course, enrollment }) => (
                    <div key={course.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem' }}>
                        <img
                          src={course.image || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=300'}
                          alt={course.title}
                          style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{course.category}</span>
                          <h3 style={{ fontSize: '1.05rem', margin: '0.2rem 0 0.4rem' }}>{course.title}</h3>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Instructor: {course.instructor}</div>
                        </div>
                      </div>

                      {/* Progress Bar & Details */}
                      <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                          <span>Course Progress:</span>
                          <strong style={{ color: 'var(--primary)' }}>
                            {enrollment.completedLessonsCount || 0} / {course.lessonsCount} Lessons ({enrollment.progressPercentage}%)
                          </strong>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                          <div style={{ background: 'var(--primary)', width: `${enrollment.progressPercentage}%`, height: '100%', transition: 'width 0.3s ease' }}></div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
                            onClick={() => handleOpenCourseDetails(course)}
                          >
                            Course Details
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
                            onClick={() => handleStartLearning(course)}
                          >
                            <PlayCircle size={15} /> Continue Learning
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* --- COURSE DETAILS MODAL (BEFORE ENROLLMENT) --- */}
      {viewingCourse && !isStudioMode && (
        <div className="modal-overlay" onClick={(e) => e.target.className.includes('modal-overlay') && setViewingCourse(null)}>
          <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', marginBottom: '0.4rem' }}>{viewingCourse.category} • {viewingCourse.level}</span>
                <h2 style={{ fontSize: '1.6rem', margin: '0.2rem 0' }}>{viewingCourse.title}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instructor: <strong>{viewingCourse.instructor}</strong></div>
              </div>
              <button className="btn-icon" onClick={() => setViewingCourse(null)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '0.4rem' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            {/* Course Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Rating:</span> <strong>⭐ {viewingCourse.rating} / 5.0</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Students:</span> <strong>{(viewingCourse.enrollmentCount || 1200).toLocaleString()}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Duration:</span> <strong>{viewingCourse.duration}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Lessons:</span> <strong>{viewingCourse.lessonsCount} Modules</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Language:</span> <strong>{viewingCourse.language || "Bengali / English"}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Certificate:</span> <strong>{viewingCourse.certificateAvailable ? '✓ Included' : 'No'}</strong></div>
            </div>

            {/* What You Will Learn Section */}
            <div style={{ marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.04)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} /> What You Will Learn
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.88rem' }}>
                {(viewingCourse.whatYouWillLearn || `✓ Understand professional communication\n✓ Communicate effectively with customers\n✓ Handle workplace conflicts\n✓ Write professional emails`).split('\n').map((line, lIdx) => (
                  <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <span>{line.startsWith('✓') ? line : `✓ ${line}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Curriculum List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Course Curriculum</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {courseLessons.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No lesson details published yet.</div>
                ) : (
                  courseLessons.map((l, idx) => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {l.isFreePreview ? <PlayCircle size={16} color="var(--primary)" /> : <Lock size={16} color="var(--text-muted)" />}
                        <div>
                          <strong>{l.lessonTitle}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.moduleTitle}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {l.isFreePreview && <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>Free Preview</span>}
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l.duration}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Bar Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Course Price:</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: viewingCourse.isFree ? 'var(--primary)' : 'var(--accent-gold)' }}>
                  {viewingCourse.isFree ? 'FREE ENROLLMENT' : `৳${viewingCourse.price?.toLocaleString()}`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button className="btn btn-secondary" onClick={() => setViewingCourse(null)}>Close</button>
                {getEnrollmentForCourse(viewingCourse.id) ? (
                  <button className="btn btn-primary" onClick={() => handleStartLearning(viewingCourse)}>
                    <PlayCircle size={16} /> Continue Learning
                  </button>
                ) : viewingCourse.isFree ? (
                  <button className="btn btn-primary" onClick={() => handleFreeEnrollment(viewingCourse)}>
                    Enroll for Free
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => handleStartPaidEnrollment(viewingCourse)}>
                    Enroll Now — ৳{viewingCourse.price}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- BANGLADESH PAYMENT SYSTEM MODAL (MOCK GATEWAY) --- */}
      {showPaymentModal && payingCourse && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                Bangladesh Payment Gateway
              </h3>
              <button className="btn-icon" onClick={() => setShowPaymentModal(false)}><X size={18} /></button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Course Title:</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{payingCourse.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                <span>Total Payable Amount:</span>
                <strong style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>৳{payingCourse.price?.toLocaleString()}</strong>
              </div>
            </div>

            {/* Select Bangladesh Payment Method */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">Select Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'BKASH', label: 'bKash', color: '#e2136e' },
                  { id: 'NAGAD', label: 'Nagad', color: '#f7941d' },
                  { id: 'ROCKET', label: 'Rocket', color: '#8c3494' },
                  { id: 'CARD', label: 'Card / Visa', color: '#2563eb' },
                  { id: 'INTERNET_BANKING', label: 'Banking', color: '#10b981' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`btn ${paymentMethod === m.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem', borderColor: paymentMethod === m.id ? m.color : 'transparent' }}
                    onClick={() => setPaymentMethod(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Account Details Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                {paymentMethod === 'CARD' ? 'Card Number' : `${paymentMethod} Mobile Number`}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={paymentMethod === 'CARD' ? '4111 2222 3333 4444' : '01711223344'}
                value={paymentAccount}
                onChange={e => setPaymentAccount(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">PIN / OTP (Simulation)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••"
                value={paymentPin}
                onChange={e => setPaymentPin(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Payment Gateway Integration Architecture: Frontend → Backend Payment Service → Gateway Verification → Course Enrollment Activation.
              </span>
            </div>

            {/* Status State Alerts */}
            {paymentState === 'PROCESSING' && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
                ⏳ Connecting to {paymentMethod} Payment Gateway... Verifying transaction.
              </div>
            )}

            {paymentState === 'SUCCESSFUL' && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
                ✓ Payment Successful! Activating course enrollment...
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" disabled={isProcessingPayment} onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={isProcessingPayment} onClick={handleProcessPayment}>
                {isProcessingPayment ? 'Processing...' : `Confirm & Pay ৳${payingCourse.price}`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- E-CERTIFICATE GENERATOR MODAL --- */}
      {certificateData && (
        <div className="modal-overlay" onClick={() => setCertificateData(null)}>
          <div className="modal-content" style={{ maxWidth: '750px', background: '#0a0f1d', border: '2px solid var(--accent-gold)', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            
            <div style={{ border: '2px solid rgba(245, 158, 11, 0.3)', padding: '2rem', textAlign: 'center', borderRadius: '12px', background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, rgba(10,15,29,1) 100%)' }}>
              <Award size={64} color="var(--accent-gold)" style={{ margin: '0 auto 1rem' }} />
              
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                SkillVerse Bangladesh Academy
              </div>
              
              <h1 style={{ fontSize: '2.2rem', margin: '0.5rem 0', fontFamily: 'serif' }}>Certificate of Completion</h1>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This is to certify that</p>
              
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.5rem 0' }}>
                {certificateData.user?.name || "SkillVerse Graduate"}
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                has successfully completed all required modules, practical evaluations, and video coursework for the professional course:
              </p>

              <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
                "{certificateData.course?.title}"
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{certificateData.course?.instructor}</div>
                  <div>Lead Instructor</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{new Date().toLocaleDateString()}</div>
                  <div>Issued Date</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary)' }}>
                    CERT-SKV-{certificateData.enrollment?.id || '99120'}
                  </div>
                  <div>Verification Code</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setCertificateData(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                alert("📜 Official PDF Certificate downloading...");
                setCertificateData(null);
              }}>
                <Download size={16} /> Print / Save Certificate PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

package com.skillverse.controller;

import com.skillverse.model.Course;
import com.skillverse.model.CourseEnrollment;
import com.skillverse.model.CourseLesson;
import com.skillverse.repository.CourseEnrollmentRepository;
import com.skillverse.repository.CourseLessonRepository;
import com.skillverse.repository.CourseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/training")
@CrossOrigin(origins = "*")
public class TrainingController {

    private final CourseRepository courseRepository;
    private final CourseLessonRepository lessonRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    public TrainingController(CourseRepository courseRepository,
                              CourseLessonRepository lessonRepository,
                              CourseEnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // --- COURSES CRUD ---

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> saveCourse(@RequestBody Course course) {
        if (course.getEnrollmentCount() == null) course.setEnrollmentCount(0);
        if (course.getRating() == null) course.setRating(5.0);
        if (course.getIsPublished() == null) course.setIsPublished(true);
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course details) {
        return courseRepository.findById(id).map(c -> {
            c.setTitle(details.getTitle());
            c.setDescription(details.getDescription());
            c.setInstructor(details.getInstructor());
            c.setCategory(details.getCategory());
            c.setLevel(details.getLevel());
            c.setDuration(details.getDuration());
            c.setLessonsCount(details.getLessonsCount());
            c.setIsFree(details.getIsFree());
            c.setPrice(details.getPrice());
            c.setImage(details.getImage());
            if (details.getIsPublished() != null) c.setIsPublished(details.getIsPublished());
            return ResponseEntity.ok(courseRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- LESSONS API ---

    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<List<CourseLesson>> getLessonsForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId));
    }

    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<CourseLesson> addLesson(@PathVariable Long courseId, @RequestBody CourseLesson lesson) {
        lesson.setCourseId(courseId);
        CourseLesson saved = lessonRepository.save(lesson);
        // update course lesson count
        courseRepository.findById(courseId).ifPresent(c -> {
            List<CourseLesson> all = lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
            c.setLessonsCount(all.size());
            courseRepository.save(c);
        });
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long lessonId) {
        lessonRepository.findById(lessonId).ifPresent(l -> {
            Long cId = l.getCourseId();
            lessonRepository.deleteById(lessonId);
            courseRepository.findById(cId).ifPresent(c -> {
                c.setLessonsCount(lessonRepository.findByCourseIdOrderByLessonOrderAsc(cId).size());
                courseRepository.save(c);
            });
        });
        return ResponseEntity.ok().build();
    }



    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<CourseLesson> updateLesson(@PathVariable Long lessonId, @RequestBody CourseLesson details) {
        return lessonRepository.findById(lessonId).map(l -> {
            l.setModuleTitle(details.getModuleTitle());
            l.setLessonTitle(details.getLessonTitle());
            l.setDescription(details.getDescription());
            l.setYoutubeVideoId(details.getYoutubeVideoId());
            l.setDuration(details.getDuration());
            l.setLessonOrder(details.getLessonOrder());
            if (details.getIsFreePreview() != null) l.setIsFreePreview(details.getIsFreePreview());
            return ResponseEntity.ok(lessonRepository.save(l));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ENROLLMENTS & PAYMENTS API ---

    @GetMapping("/enrollments/user/{userId}")
    public ResponseEntity<List<CourseEnrollment>> getUserEnrollments(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentRepository.findByUserId(userId));
    }

    @GetMapping("/enrollments/all")
    public ResponseEntity<List<CourseEnrollment>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentRepository.findAll());
    }

    @PostMapping("/enroll")
    public ResponseEntity<CourseEnrollment> enrollCourse(@RequestBody Map<String, Object> req) {
        Long userId = Long.valueOf(req.get("userId").toString());
        Long courseId = Long.valueOf(req.get("courseId").toString());
        String method = req.get("paymentMethod") != null ? req.get("paymentMethod").toString() : "NONE";
        String status = req.get("paymentStatus") != null ? req.get("paymentStatus").toString() : "FREE";
        String txId = req.get("transactionId") != null ? req.get("transactionId").toString() : "TXN-" + System.currentTimeMillis();
        Double price = req.get("amountPaid") != null ? Double.valueOf(req.get("amountPaid").toString()) : 0.0;

        Optional<CourseEnrollment> existing = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        CourseEnrollment enrollment;
        if (existing.isPresent()) {
            enrollment = existing.get();
            enrollment.setPaymentStatus(status);
            enrollment.setPaymentMethod(method);
            enrollment.setTransactionId(txId);
            enrollment.setAmountPaid(price);
            enrollment.setLastAccessedAt(LocalDateTime.now());
        } else {
            enrollment = new CourseEnrollment(userId, courseId, status, method, txId, price);
        }
        CourseEnrollment saved = enrollmentRepository.save(enrollment);

        // Update student count in course if payment is SUCCESSFUL or FREE
        if ("SUCCESSFUL".equalsIgnoreCase(status) || "FREE".equalsIgnoreCase(status)) {
            courseRepository.findById(courseId).ifPresent(c -> {
                c.setEnrollmentCount((c.getEnrollmentCount() != null ? c.getEnrollmentCount() : 0) + 1);
                courseRepository.save(c);
            });
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/enrollments/{id}/progress")
    public ResponseEntity<CourseEnrollment> updateProgress(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        return enrollmentRepository.findById(id).map(e -> {
            if (req.containsKey("completedCount")) {
                e.setCompletedLessonsCount(Integer.parseInt(req.get("completedCount").toString()));
            }
            if (req.containsKey("progressPercentage")) {
                e.setProgressPercentage(Integer.parseInt(req.get("progressPercentage").toString()));
            }
            if (req.containsKey("lastWatchedLessonId")) {
                e.setLastWatchedLessonId(Long.parseLong(req.get("lastWatchedLessonId").toString()));
            }
            if (req.containsKey("completedLessonIds")) {
                e.setCompletedLessonIds(req.get("completedLessonIds").toString());
            }
            if (req.containsKey("isCompleted")) {
                boolean comp = Boolean.parseBoolean(req.get("isCompleted").toString());
                e.setIsCompleted(comp);
                if (comp && e.getCompletedAt() == null) {
                    e.setCompletedAt(LocalDateTime.now());
                }
            }
            e.setLastAccessedAt(LocalDateTime.now());
            return ResponseEntity.ok(enrollmentRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/enrollments/{id}/status")
    public ResponseEntity<CourseEnrollment> updateEnrollmentStatus(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        return enrollmentRepository.findById(id).map(e -> {
            if (req.containsKey("paymentStatus")) {
                e.setPaymentStatus(req.get("paymentStatus").toString());
            }
            return ResponseEntity.ok(enrollmentRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- STUDENT / USER ACADEMY ACTIVITY PROFILE ---

    @GetMapping("/user-profile/{userId}")
    public ResponseEntity<Map<String, Object>> getUserAcademyProfile(@PathVariable Long userId) {
        List<CourseEnrollment> userEnrollments = enrollmentRepository.findByUserId(userId);
        long totalEnrolled = userEnrollments.size();
        long completed = userEnrollments.stream().filter(e -> Boolean.TRUE.equals(e.getIsCompleted())).count();
        long learning = userEnrollments.stream().filter(e -> !Boolean.TRUE.equals(e.getIsCompleted())).count();
        double totalSpent = userEnrollments.stream()
                .filter(e -> "SUCCESSFUL".equalsIgnoreCase(e.getPaymentStatus()))
                .mapToDouble(e -> e.getAmountPaid() != null ? e.getAmountPaid() : 0.0)
                .sum();

        Map<String, Object> res = new HashMap<>();
        res.put("userId", userId);
        res.put("coursesEnrolled", totalEnrolled);
        res.put("coursesCompleted", completed);
        res.put("currentlyLearning", learning);
        res.put("totalAmountSpent", totalSpent);
        res.put("enrollments", userEnrollments);

        return ResponseEntity.ok(res);
    }

    // --- ANALYTICS DASHBOARD API ---

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAcademyAnalytics() {
        List<Course> courses = courseRepository.findAll();
        List<CourseEnrollment> enrollments = enrollmentRepository.findAll();

        long totalCourses = courses.size();
        long freeCourses = courses.stream().filter(c -> Boolean.TRUE.equals(c.getIsFree())).count();
        long paidCourses = courses.stream().filter(c -> !Boolean.TRUE.equals(c.getIsFree())).count();

        long totalEnrollments = enrollments.size();
        long activeLearners = enrollments.stream().filter(e -> !Boolean.TRUE.equals(e.getIsCompleted())).count();
        long completedLearners = enrollments.stream().filter(e -> Boolean.TRUE.equals(e.getIsCompleted())).count();

        double totalRevenue = enrollments.stream()
                .filter(e -> "SUCCESSFUL".equalsIgnoreCase(e.getPaymentStatus()))
                .mapToDouble(e -> e.getAmountPaid() != null ? e.getAmountPaid() : 0.0)
                .sum();

        // Course breakdown list
        List<Map<String, Object>> courseStats = new ArrayList<>();
        for (Course c : courses) {
            List<CourseEnrollment> cEnrolls = enrollments.stream().filter(e -> e.getCourseId().equals(c.getId())).toList();
            long cTotal = cEnrolls.size();
            long cCompleted = cEnrolls.stream().filter(e -> Boolean.TRUE.equals(e.getIsCompleted())).count();
            long cActive = cTotal - cCompleted;
            double cRev = cEnrolls.stream()
                    .filter(e -> "SUCCESSFUL".equalsIgnoreCase(e.getPaymentStatus()))
                    .mapToDouble(e -> e.getAmountPaid() != null ? e.getAmountPaid() : 0.0)
                    .sum();
            double cCompletionRate = cTotal > 0 ? ((double) cCompleted / cTotal) * 100.0 : 0.0;

            Map<String, Object> stat = new HashMap<>();
            stat.put("courseId", c.getId());
            stat.put("title", c.getTitle());
            stat.put("category", c.getCategory());
            stat.put("isFree", c.getIsFree());
            stat.put("price", c.getPrice());
            stat.put("enrollments", cTotal);
            stat.put("completed", cCompleted);
            stat.put("active", cActive);
            stat.put("revenue", cRev);
            stat.put("completionRate", Math.round(cCompletionRate * 10.0) / 10.0);
            courseStats.add(stat);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("totalCourses", totalCourses);
        res.put("freeCourses", freeCourses);
        res.put("paidCourses", paidCourses);
        res.put("totalEnrollments", totalEnrollments);
        res.put("activeLearners", activeLearners);
        res.put("completedLearners", completedLearners);
        res.put("totalRevenue", totalRevenue);
        res.put("courseStats", courseStats);

        return ResponseEntity.ok(res);
    }
}

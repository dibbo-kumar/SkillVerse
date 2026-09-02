package com.skillverse.repository;

import com.skillverse.model.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByUserId(Long userId);
    List<CourseEnrollment> findByCourseId(Long courseId);
    Optional<CourseEnrollment> findByUserIdAndCourseId(Long userId, Long courseId);
}

package com.skillverse.repository;

import com.skillverse.model.CourseLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseLessonRepository extends JpaRepository<CourseLesson, Long> {
    List<CourseLesson> findByCourseIdOrderByLessonOrderAsc(Long courseId);
}

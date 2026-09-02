package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_enrollments")
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long courseId;

    private String paymentStatus; // FREE, PENDING, SUCCESSFUL, FAILED
    private String paymentMethod; // BKASH, NAGAD, ROCKET, CARD, NONE
    private String transactionId;
    private Double amountPaid;

    private Integer progressPercentage = 0;
    private Integer completedLessonsCount = 0;
    private Long lastWatchedLessonId;
    private String completedLessonIds; // e.g. "1,2,5"
    private Boolean isCompleted = false;

    private LocalDateTime enrolledAt = LocalDateTime.now();
    private LocalDateTime completedAt;
    private LocalDateTime lastAccessedAt = LocalDateTime.now();

    public CourseEnrollment() {}

    public CourseEnrollment(Long userId, Long courseId, String paymentStatus, String paymentMethod, String transactionId, Double amountPaid) {
        this.userId = userId;
        this.courseId = courseId;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.amountPaid = amountPaid;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public Integer getCompletedLessonsCount() { return completedLessonsCount; }
    public void setCompletedLessonsCount(Integer completedLessonsCount) { this.completedLessonsCount = completedLessonsCount; }

    public Long getLastWatchedLessonId() { return lastWatchedLessonId; }
    public void setLastWatchedLessonId(Long lastWatchedLessonId) { this.lastWatchedLessonId = lastWatchedLessonId; }

    public String getCompletedLessonIds() { return completedLessonIds; }
    public void setCompletedLessonIds(String completedLessonIds) { this.completedLessonIds = completedLessonIds; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getLastAccessedAt() { return lastAccessedAt; }
    public void setLastAccessedAt(LocalDateTime lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }
}

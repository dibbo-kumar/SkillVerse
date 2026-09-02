package com.skillverse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "course_lessons")
public class CourseLesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;
    private String moduleTitle; // e.g. "Module 1 — Introduction"
    private String lessonTitle; // e.g. "Lesson 1: Workplace Etiquette"
    
    @Column(length = 1000)
    private String description;
    
    private String youtubeVideoId; // e.g. "dQw4w9WgXcQ"
    private String duration;       // e.g. "12:45"
    private Integer lessonOrder;
    private Boolean isFreePreview = false;

    public CourseLesson() {}

    public CourseLesson(Long courseId, String moduleTitle, String lessonTitle, String description, String youtubeVideoId, String duration, Integer lessonOrder, Boolean isFreePreview) {
        this.courseId = courseId;
        this.moduleTitle = moduleTitle;
        this.lessonTitle = lessonTitle;
        this.description = description;
        this.youtubeVideoId = youtubeVideoId;
        this.duration = duration;
        this.lessonOrder = lessonOrder;
        this.isFreePreview = isFreePreview;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getModuleTitle() { return moduleTitle; }
    public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }

    public String getLessonTitle() { return lessonTitle; }
    public void setLessonTitle(String lessonTitle) { this.lessonTitle = lessonTitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getYoutubeVideoId() { return youtubeVideoId; }
    public void setYoutubeVideoId(String youtubeVideoId) { this.youtubeVideoId = youtubeVideoId; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Integer getLessonOrder() { return lessonOrder; }
    public void setLessonOrder(Integer lessonOrder) { this.lessonOrder = lessonOrder; }

    public Boolean getIsFreePreview() { return isFreePreview; }
    public void setIsFreePreview(Boolean isFreePreview) { this.isFreePreview = isFreePreview; }
}

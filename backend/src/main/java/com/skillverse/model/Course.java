package com.skillverse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String instructor;
    private String duration;
    private Double rating;
    private Integer enrollmentCount;
    private String image;

    public Course() {}

    public Course(String title, String description, String instructor, String duration, Double rating, Integer enrollmentCount, String image) {
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.duration = duration;
        this.rating = rating;
        this.enrollmentCount = enrollmentCount;
        this.image = image;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getEnrollmentCount() { return enrollmentCount; }
    public void setEnrollmentCount(Integer enrollmentCount) { this.enrollmentCount = enrollmentCount; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}

package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(length = 2000)
    private String description;
    
    private String instructor;
    private String category; // Communication, Electrical, HVAC, Plumbing, Safety, Smart Home
    private String level;    // Beginner, Intermediate, Advanced
    private String duration; // e.g. "6 hours"
    private Integer lessonsCount;
    private Double rating;
    private Integer enrollmentCount;
    private Boolean isFree;
    private Double price;    // in BDT (৳)
    private String image;
    private Boolean isPublished = true;
    private String language = "Bengali / English";
    private Boolean certificateAvailable = true;
    
    @Column(length = 2000)
    private String whatYouWillLearn;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Course() {}

    public Course(String title, String description, String instructor, String category, String level, String duration, Integer lessonsCount, Double rating, Integer enrollmentCount, Boolean isFree, Double price, String image) {
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.category = category;
        this.level = level;
        this.duration = duration;
        this.lessonsCount = lessonsCount;
        this.rating = rating;
        this.enrollmentCount = enrollmentCount;
        this.isFree = isFree;
        this.price = price;
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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Integer getLessonsCount() { return lessonsCount; }
    public void setLessonsCount(Integer lessonsCount) { this.lessonsCount = lessonsCount; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getEnrollmentCount() { return enrollmentCount; }
    public void setEnrollmentCount(Integer enrollmentCount) { this.enrollmentCount = enrollmentCount; }

    public Boolean getIsFree() { return isFree; }
    public void setIsFree(Boolean isFree) { this.isFree = isFree; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Boolean getCertificateAvailable() { return certificateAvailable; }
    public void setCertificateAvailable(Boolean certificateAvailable) { this.certificateAvailable = certificateAvailable; }

    public String getWhatYouWillLearn() { return whatYouWillLearn; }
    public void setWhatYouWillLearn(String whatYouWillLearn) { this.whatYouWillLearn = whatYouWillLearn; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

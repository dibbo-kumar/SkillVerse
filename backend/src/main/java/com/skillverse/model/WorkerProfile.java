package com.skillverse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "worker_profiles")
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String skills; // comma separated e.g. "Plumbing, Electrical"
    private Integer experienceYears;
    private String serviceArea;
    private String careerLevel; // Beginner, Bronze, Silver, Gold, Platinum, Master
    private Double hourlyRate;
    private boolean isAvailable;
    private Double latitude = 23.8720;
    private Double longitude = 90.3810;

    public WorkerProfile() {}

    public WorkerProfile(User user, String skills, Integer experienceYears, String serviceArea, String careerLevel, Double hourlyRate) {
        this.user = user;
        this.skills = skills;
        this.experienceYears = experienceYears;
        this.serviceArea = serviceArea;
        this.careerLevel = careerLevel;
        this.hourlyRate = hourlyRate;
        this.isAvailable = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }

    public String getCareerLevel() { return careerLevel; }
    public void setCareerLevel(String careerLevel) { this.careerLevel = careerLevel; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}

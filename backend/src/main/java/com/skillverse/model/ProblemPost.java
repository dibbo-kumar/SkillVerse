package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "problem_posts")
public class ProblemPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    private String serviceCategory;
    private String title;
    @Column(length = 2000)
    private String description;

    private String applianceInfo;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    private String preferredDate;
    private String preferredTime;
    private String address;

    private Double budgetPrice;
    private String status = "OPEN"; // OPEN, ASSIGNED, CLOSED

    private LocalDateTime createdAt = LocalDateTime.now();

    public ProblemPost() {}

    public ProblemPost(User customer, String serviceCategory, String title, String description, 
                       String applianceInfo, String photoUrl, String preferredDate, 
                       String preferredTime, String address, Double budgetPrice) {
        this.customer = customer;
        this.serviceCategory = serviceCategory;
        this.title = title;
        this.description = description;
        this.applianceInfo = applianceInfo;
        this.photoUrl = photoUrl;
        this.preferredDate = preferredDate;
        this.preferredTime = preferredTime;
        this.address = address;
        this.budgetPrice = budgetPrice;
        this.status = "OPEN";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getApplianceInfo() { return applianceInfo; }
    public void setApplianceInfo(String applianceInfo) { this.applianceInfo = applianceInfo; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getPreferredDate() { return preferredDate; }
    public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }

    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getBudgetPrice() { return budgetPrice; }
    public void setBudgetPrice(Double budgetPrice) { this.budgetPrice = budgetPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

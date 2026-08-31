package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class ServiceBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User worker;

    private String serviceType;
    private String status; // PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
    private LocalDateTime scheduledTime;
    private Double estimatedCost;
    private String description;
    
    // Safety & tracking verification
    private String startVerificationCode;
    private String completionVerificationCode;
    private String liveLocation;
    private String beforePhoto;
    private String afterPhoto;

    public ServiceBooking() {
        generateVerificationCodes();
    }

    public ServiceBooking(User customer, User worker, String serviceType, LocalDateTime scheduledTime, Double estimatedCost, String description) {
        this.customer = customer;
        this.worker = worker;
        this.serviceType = serviceType;
        this.scheduledTime = scheduledTime;
        this.estimatedCost = estimatedCost;
        this.description = description;
        this.status = "PENDING";
        generateVerificationCodes();
    }

    @PrePersist
    public void generateVerificationCodes() {
        java.util.Random random = new java.util.Random();
        if (this.startVerificationCode == null || this.startVerificationCode.trim().isEmpty()) {
            this.startVerificationCode = String.format("%04d", random.nextInt(10000));
        }
        if (this.completionVerificationCode == null || this.completionVerificationCode.trim().isEmpty()) {
            this.completionVerificationCode = String.format("%04d", random.nextInt(10000));
        }
        if (this.liveLocation == null || this.liveLocation.trim().isEmpty()) {
            this.liveLocation = "23.8103, 90.4125";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public User getWorker() { return worker; }
    public void setWorker(User worker) { this.worker = worker; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartVerificationCode() { return startVerificationCode; }
    public void setStartVerificationCode(String startVerificationCode) { this.startVerificationCode = startVerificationCode; }

    public String getCompletionVerificationCode() { return completionVerificationCode; }
    public void setCompletionVerificationCode(String completionVerificationCode) { this.completionVerificationCode = completionVerificationCode; }

    public String getLiveLocation() { return liveLocation; }
    public void setLiveLocation(String liveLocation) { this.liveLocation = liveLocation; }

    public String getBeforePhoto() { return beforePhoto; }
    public void setBeforePhoto(String beforePhoto) { this.beforePhoto = beforePhoto; }

    public String getAfterPhoto() { return afterPhoto; }
    public void setAfterPhoto(String afterPhoto) { this.afterPhoto = afterPhoto; }
}

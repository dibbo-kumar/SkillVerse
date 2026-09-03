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
    private String status; 
    // Lifecycle states:
    // PENDING, NEGOTIATING, PRICE_AGREED, CONFIRMED, ON_THE_WAY, ARRIVED, 
    // IN_PROGRESS, COMPLETION_REQUESTED, COMPLETED, PAID, CANCELLED

    private String bookingSource = "DIRECT"; // DIRECT, POSTED_PROBLEM

    private LocalDateTime scheduledTime;
    private String preferredDate;
    private String preferredTime;
    private String address;
    private String description;
    private String applianceDetails;

    // Price Negotiation & Locked Financials
    private Double estimatedCost; // Current price / Initial offer
    private Double customerOfferPrice;
    private Double workerCounterPrice;
    private String lastOfferedBy; // CUSTOMER, WORKER
    private Double agreedCost; // Locked final agreed cost

    private Double platformCommission = 0.0;
    private Double workerNetEarning = 0.0;

    // Safety & tracking verification
    private String startVerificationCode;
    private String completionVerificationCode;
    private Boolean startOtpVerified = false;
    private Boolean completionOtpVerified = false;

    private String liveLocation;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String beforePhoto;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String afterPhoto;

    // Payment fields
    private String paymentStatus = "UNPAID"; // UNPAID, PAID
    private String paymentMethod; // BKASH, NAGAD, ROCKET, BANK, CASH
    private String transactionId;
    private LocalDateTime paidAt;

    // Customer Review
    private Integer reviewRating;
    private String reviewComment;
    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ServiceBooking() {
        generateVerificationCodes();
    }

    public ServiceBooking(User customer, User worker, String serviceType, LocalDateTime scheduledTime, Double estimatedCost, String description) {
        this.customer = customer;
        this.worker = worker;
        this.serviceType = serviceType;
        this.scheduledTime = scheduledTime;
        this.estimatedCost = estimatedCost;
        this.customerOfferPrice = estimatedCost;
        this.agreedCost = estimatedCost;
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
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public String getBookingSource() { return bookingSource; }
    public void setBookingSource(String bookingSource) { this.bookingSource = bookingSource; }

    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public String getPreferredDate() { return preferredDate; }
    public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }

    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getApplianceDetails() { return applianceDetails; }
    public void setApplianceDetails(String applianceDetails) { this.applianceDetails = applianceDetails; }

    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

    public Double getCustomerOfferPrice() { return customerOfferPrice; }
    public void setCustomerOfferPrice(Double customerOfferPrice) { this.customerOfferPrice = customerOfferPrice; }

    public Double getWorkerCounterPrice() { return workerCounterPrice; }
    public void setWorkerCounterPrice(Double workerCounterPrice) { this.workerCounterPrice = workerCounterPrice; }

    public String getLastOfferedBy() { return lastOfferedBy; }
    public void setLastOfferedBy(String lastOfferedBy) { this.lastOfferedBy = lastOfferedBy; }

    public Double getAgreedCost() { return agreedCost; }
    public void setAgreedCost(Double agreedCost) { this.agreedCost = agreedCost; }

    public Double getPlatformCommission() { return platformCommission; }
    public void setPlatformCommission(Double platformCommission) { this.platformCommission = platformCommission; }

    public Double getWorkerNetEarning() { return workerNetEarning; }
    public void setWorkerNetEarning(Double workerNetEarning) { this.workerNetEarning = workerNetEarning; }

    public String getStartVerificationCode() { return startVerificationCode; }
    public void setStartVerificationCode(String startVerificationCode) { this.startVerificationCode = startVerificationCode; }

    public String getCompletionVerificationCode() { return completionVerificationCode; }
    public void setCompletionVerificationCode(String completionVerificationCode) { this.completionVerificationCode = completionVerificationCode; }

    public Boolean getStartOtpVerified() { return startOtpVerified; }
    public void setStartOtpVerified(Boolean startOtpVerified) { this.startOtpVerified = startOtpVerified; }

    public Boolean getCompletionOtpVerified() { return completionOtpVerified; }
    public void setCompletionOtpVerified(Boolean completionOtpVerified) { this.completionOtpVerified = completionOtpVerified; }

    public String getLiveLocation() { return liveLocation; }
    public void setLiveLocation(String liveLocation) { this.liveLocation = liveLocation; }

    public String getBeforePhoto() { return beforePhoto; }
    public void setBeforePhoto(String beforePhoto) { this.beforePhoto = beforePhoto; }

    public String getAfterPhoto() { return afterPhoto; }
    public void setAfterPhoto(String afterPhoto) { this.afterPhoto = afterPhoto; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public Integer getReviewRating() { return reviewRating; }
    public void setReviewRating(Integer reviewRating) { this.reviewRating = reviewRating; }

    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

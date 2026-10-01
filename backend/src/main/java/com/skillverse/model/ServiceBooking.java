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

    private String assignedWorkerName; // Name of non-tech team member assigned by Lead Worker

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

    // Base Price & Minimum Advance Payment (5% VAT)
    private Double basePrice = 300.0;
    private Double advancePaidAmount = 0.0;
    private Double advanceVatAmount = 0.0;
    private Boolean advancePaid = false;
    private String advancePaymentMethod;
    private String advancePaymentMobile;
    private LocalDateTime advancePaidAt;

    // Final Completion Payment (Custom adjusted amount, instant, no OTP)
    private Double finalPaymentAmount;
    private String finalPaymentMobile;

    // Distance-Based Arrival & Timer
    private Double distanceMeters = 1500.0; // Default distance in meters (e.g. 1.5 km)
    private Double arrivalTimeHours = 1.5;  // 1 hour per 1000m
    private LocalDateTime arrivalDeadline;

    // Instant Cashback / Refund on Timeout Rejection
    private Boolean isRefunded = false;
    private Double refundAmount = 0.0;
    private String refundMobile;
    private LocalDateTime refundedAt;

    // Customer Review
    private Integer reviewRating;
    private String reviewComment;
    private LocalDateTime reviewedAt;

    // 30-Day Warranty Service Claim Feature
    private LocalDateTime completedAt;
    private String warrantyStatus; // ELIGIBLE, WARRANTY_CLAIMED, WARRANTY_ACCEPTED, WARRANTY_COMPLETED, EXPIRED
    private Boolean warrantyClaimed = false;
    private LocalDateTime warrantyClaimedAt;
    private LocalDateTime warrantyAcceptedAt;
    private LocalDateTime warrantyCompletedAt;
    private String warrantyProblemDescription;

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

    public Double getBasePrice() { return basePrice != null ? basePrice : 300.0; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public Double getAdvancePaidAmount() { return advancePaidAmount; }
    public void setAdvancePaidAmount(Double advancePaidAmount) { this.advancePaidAmount = advancePaidAmount; }

    public Double getAdvanceVatAmount() { return advanceVatAmount; }
    public void setAdvanceVatAmount(Double advanceVatAmount) { this.advanceVatAmount = advanceVatAmount; }

    public Boolean getAdvancePaid() { return advancePaid != null && advancePaid; }
    public void setAdvancePaid(Boolean advancePaid) { this.advancePaid = advancePaid; }

    public String getAdvancePaymentMethod() { return advancePaymentMethod; }
    public void setAdvancePaymentMethod(String advancePaymentMethod) { this.advancePaymentMethod = advancePaymentMethod; }

    public String getAdvancePaymentMobile() { return advancePaymentMobile; }
    public void setAdvancePaymentMobile(String advancePaymentMobile) { this.advancePaymentMobile = advancePaymentMobile; }

    public LocalDateTime getAdvancePaidAt() { return advancePaidAt; }
    public void setAdvancePaidAt(LocalDateTime advancePaidAt) { this.advancePaidAt = advancePaidAt; }

    public Double getFinalPaymentAmount() { return finalPaymentAmount; }
    public void setFinalPaymentAmount(Double finalPaymentAmount) { this.finalPaymentAmount = finalPaymentAmount; }

    public String getFinalPaymentMobile() { return finalPaymentMobile; }
    public void setFinalPaymentMobile(String finalPaymentMobile) { this.finalPaymentMobile = finalPaymentMobile; }

    public Double getDistanceMeters() { return distanceMeters != null ? distanceMeters : 1500.0; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Double getArrivalTimeHours() { return arrivalTimeHours != null ? arrivalTimeHours : 1.5; }
    public void setArrivalTimeHours(Double arrivalTimeHours) { this.arrivalTimeHours = arrivalTimeHours; }

    public LocalDateTime getArrivalDeadline() { return arrivalDeadline; }
    public void setArrivalDeadline(LocalDateTime arrivalDeadline) { this.arrivalDeadline = arrivalDeadline; }

    public Boolean getIsRefunded() { return isRefunded != null && isRefunded; }
    public void setIsRefunded(Boolean isRefunded) { this.isRefunded = isRefunded; }

    public Double getRefundAmount() { return refundAmount != null ? refundAmount : 0.0; }
    public void setRefundAmount(Double refundAmount) { this.refundAmount = refundAmount; }

    public String getRefundMobile() { return refundMobile; }
    public void setRefundMobile(String refundMobile) { this.refundMobile = refundMobile; }

    public LocalDateTime getRefundedAt() { return refundedAt; }
    public void setRefundedAt(LocalDateTime refundedAt) { this.refundedAt = refundedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getWarrantyStatus() { return warrantyStatus; }
    public void setWarrantyStatus(String warrantyStatus) { this.warrantyStatus = warrantyStatus; }

    public Boolean getWarrantyClaimed() { return warrantyClaimed != null && warrantyClaimed; }
    public void setWarrantyClaimed(Boolean warrantyClaimed) { this.warrantyClaimed = warrantyClaimed; }

    public LocalDateTime getWarrantyClaimedAt() { return warrantyClaimedAt; }
    public void setWarrantyClaimedAt(LocalDateTime warrantyClaimedAt) { this.warrantyClaimedAt = warrantyClaimedAt; }

    public LocalDateTime getWarrantyAcceptedAt() { return warrantyAcceptedAt; }
    public void setWarrantyAcceptedAt(LocalDateTime warrantyAcceptedAt) { this.warrantyAcceptedAt = warrantyAcceptedAt; }

    public LocalDateTime getWarrantyCompletedAt() { return warrantyCompletedAt; }
    public void setWarrantyCompletedAt(LocalDateTime warrantyCompletedAt) { this.warrantyCompletedAt = warrantyCompletedAt; }

    public String getWarrantyProblemDescription() { return warrantyProblemDescription; }
    public void setWarrantyProblemDescription(String warrantyProblemDescription) { this.warrantyProblemDescription = warrantyProblemDescription; }

    public String getAssignedWorkerName() { return assignedWorkerName; }
    public void setAssignedWorkerName(String assignedWorkerName) { this.assignedWorkerName = assignedWorkerName; }
}

package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User worker;

    private String transactionType; // SERVICE_EARNING, PLATFORM_FEE, WITHDRAWAL, COD_PLATFORM_FEE
    private Double amount;
    private String description;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = true)
    private ServiceBooking booking;

    private String status = "COMPLETED"; // COMPLETED, PENDING, REJECTED
    private LocalDateTime createdAt = LocalDateTime.now();

    public WalletTransaction() {}

    public WalletTransaction(User worker, String transactionType, Double amount, String description, ServiceBooking booking) {
        this.worker = worker;
        this.transactionType = transactionType;
        this.amount = amount;
        this.description = description;
        this.booking = booking;
        this.status = "COMPLETED";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getWorker() { return worker; }
    public void setWorker(User worker) { this.worker = worker; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ServiceBooking getBooking() { return booking; }
    public void setBooking(ServiceBooking booking) { this.booking = booking; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_wallets")
public class WorkerWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "worker_id", unique = true)
    private User worker;

    private Double balance = 0.0;
    private Double totalEarnings = 0.0;
    private Double totalPlatformFees = 0.0;
    private Double totalWithdrawals = 0.0;
    private Double outstandingFees = 0.0;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public WorkerWallet() {}

    public WorkerWallet(User worker) {
        this.worker = worker;
        this.balance = 0.0;
        this.totalEarnings = 0.0;
        this.totalPlatformFees = 0.0;
        this.totalWithdrawals = 0.0;
        this.outstandingFees = 0.0;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getWorker() { return worker; }
    public void setWorker(User worker) { this.worker = worker; }

    public Double getBalance() { return balance != null ? Math.max(0.0, balance) : 0.0; }
    public void setBalance(Double balance) { this.balance = balance != null ? Math.max(0.0, Math.round(balance * 100.0) / 100.0) : 0.0; }

    public Double getTotalEarnings() { return totalEarnings != null ? totalEarnings : 0.0; }
    public void setTotalEarnings(Double totalEarnings) { this.totalEarnings = totalEarnings != null ? Math.max(0.0, totalEarnings) : 0.0; }

    public Double getTotalPlatformFees() { return totalPlatformFees != null ? totalPlatformFees : 0.0; }
    public void setTotalPlatformFees(Double totalPlatformFees) { this.totalPlatformFees = totalPlatformFees != null ? Math.max(0.0, totalPlatformFees) : 0.0; }

    public Double getTotalWithdrawals() { return totalWithdrawals != null ? totalWithdrawals : 0.0; }
    public void setTotalWithdrawals(Double totalWithdrawals) { this.totalWithdrawals = totalWithdrawals != null ? Math.max(0.0, totalWithdrawals) : 0.0; }

    public Double getOutstandingFees() { return outstandingFees != null ? outstandingFees : 0.0; }
    public void setOutstandingFees(Double outstandingFees) { this.outstandingFees = outstandingFees != null ? Math.max(0.0, outstandingFees) : 0.0; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

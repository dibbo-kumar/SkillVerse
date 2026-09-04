package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action; // e.g. "WORKER_APPROVED", "USER_SUSPENDED", "BOOKING_COMPLETED", "WITHDRAWAL_APPROVED"
    private String actorName; // "System Admin", "Kamrul Islam", etc.
    private String actorRole; // "ADMIN", "WORKER", "CUSTOMER", "SYSTEM"
    private String targetEntity; // "Worker", "User", "Booking", "Wallet", "Product", "Course"
    private Long targetId;
    
    @Column(length = 1000)
    private String details;

    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog() {}

    public AuditLog(String action, String actorName, String actorRole, String targetEntity, Long targetId, String details) {
        this.action = action;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.targetEntity = targetEntity;
        this.targetId = targetId;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getTargetEntity() { return targetEntity; }
    public void setTargetEntity(String targetEntity) { this.targetEntity = targetEntity; }

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

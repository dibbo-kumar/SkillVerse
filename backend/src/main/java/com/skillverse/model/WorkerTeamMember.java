package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_team_members")
public class WorkerTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lead_worker_id", nullable = false)
    private User leadWorker;

    @Column(nullable = false)
    private String name;

    private String phone;

    @Column(nullable = false)
    private String skill; // e.g. "Plumbing", "Electrical", "AC Repair"

    private Integer experienceYears = 3;

    private String status = "PENDING_VERIFICATION"; // PENDING_VERIFICATION, VERIFIED, REJECTED, INACTIVE

    private Boolean isVerified = false;

    private LocalDateTime verifiedAt;

    private LocalDateTime createdAt;

    public WorkerTeamMember() {}

    public WorkerTeamMember(User leadWorker, String name, String phone, String skill, Integer experienceYears) {
        this.leadWorker = leadWorker;
        this.name = name;
        this.phone = phone;
        this.skill = skill;
        this.experienceYears = experienceYears != null ? experienceYears : 3;
        this.status = "PENDING_VERIFICATION";
        this.isVerified = false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getLeadWorker() { return leadWorker; }
    public void setLeadWorker(User leadWorker) { this.leadWorker = leadWorker; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsVerified() { return isVerified != null && isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

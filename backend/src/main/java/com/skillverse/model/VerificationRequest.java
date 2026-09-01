package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_requests")
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String nidNumber;
    private String nidFrontPhoto;
    private String nidBackPhoto;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime submittedAt;

    public VerificationRequest() {}

    public VerificationRequest(User user, String nidNumber, String nidFrontPhoto, String nidBackPhoto) {
        this.user = user;
        this.nidNumber = nidNumber;
        this.nidFrontPhoto = nidFrontPhoto;
        this.nidBackPhoto = nidBackPhoto;
        this.status = "PENDING";
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getNidNumber() { return nidNumber; }
    public void setNidNumber(String nidNumber) { this.nidNumber = nidNumber; }

    public String getNidFrontPhoto() { return nidFrontPhoto; }
    public void setNidFrontPhoto(String nidFrontPhoto) { this.nidFrontPhoto = nidFrontPhoto; }

    public String getNidBackPhoto() { return nidBackPhoto; }
    public void setNidBackPhoto(String nidBackPhoto) { this.nidBackPhoto = nidBackPhoto; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}

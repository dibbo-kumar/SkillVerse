package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "problem_offers")
public class ProblemOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "problem_post_id")
    private ProblemPost problemPost;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User worker;

    private Double proposedPrice;
    private String message;
    private String estimatedArrival;

    private String status = "PENDING"; // PENDING, ACCEPTED, DECLINED

    private LocalDateTime createdAt = LocalDateTime.now();

    public ProblemOffer() {}

    public ProblemOffer(ProblemPost problemPost, User worker, Double proposedPrice, String message, String estimatedArrival) {
        this.problemPost = problemPost;
        this.worker = worker;
        this.proposedPrice = proposedPrice;
        this.message = message;
        this.estimatedArrival = estimatedArrival;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProblemPost getProblemPost() { return problemPost; }
    public void setProblemPost(ProblemPost problemPost) { this.problemPost = problemPost; }

    public User getWorker() { return worker; }
    public void setWorker(User worker) { this.worker = worker; }

    public Double getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(Double proposedPrice) { this.proposedPrice = proposedPrice; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEstimatedArrival() { return estimatedArrival; }
    public void setEstimatedArrival(String estimatedArrival) { this.estimatedArrival = estimatedArrival; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

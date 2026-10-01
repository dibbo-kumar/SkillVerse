package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_availability_slots")
public class WorkerAvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private User worker;

    @Column(nullable = false)
    private LocalDate slotDate;

    @Column(nullable = false)
    private String startTime; // e.g. "09:00"

    @Column(nullable = false)
    private String endTime; // e.g. "11:00"

    private boolean isBooked = false;

    private Long bookingId; // Reference to ServiceBooking ID if booked

    private LocalDateTime createdAt;

    public WorkerAvailabilitySlot() {}

    public WorkerAvailabilitySlot(User worker, LocalDate slotDate, String startTime, String endTime) {
        this.worker = worker;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isBooked = false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getWorker() { return worker; }
    public void setWorker(User worker) { this.worker = worker; }

    public LocalDate getSlotDate() { return slotDate; }
    public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public boolean isBooked() { return isBooked; }
    public void setBooked(boolean booked) { isBooked = booked; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

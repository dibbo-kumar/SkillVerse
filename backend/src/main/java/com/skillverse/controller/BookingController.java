package com.skillverse.controller;

import com.skillverse.model.ServiceBooking;
import com.skillverse.model.User;
import com.skillverse.repository.ServiceBookingRepository;
import com.skillverse.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final ServiceBookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingController(ServiceBookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        User customer = userRepository.findById(request.getCustomerId()).orElse(null);
        User worker = userRepository.findById(request.getWorkerId()).orElse(null);

        if (customer == null || worker == null) {
            return ResponseEntity.badRequest().body("Invalid Customer or Worker ID");
        }

        ServiceBooking booking = new ServiceBooking(
                customer,
                worker,
                request.getServiceType(),
                LocalDateTime.now().plusDays(2),
                request.getEstimatedCost(),
                request.getDescription()
        );

        // Generate dynamic verification codes for safety verification workflow
        Random random = new Random();
        booking.setStartVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setCompletionVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setLiveLocation("23.8103, 90.4125"); // Dhaka coordinates default
        
        ServiceBooking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ServiceBooking>> getCustomerBookings(@PathVariable Long customerId) {
        return ResponseEntity.ok(bookingRepository.findByCustomerId(customerId));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<ServiceBooking>> getWorkerBookings(@PathVariable Long workerId) {
        return ResponseEntity.ok(bookingRepository.findByWorkerId(workerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    booking.setStatus(status);
                    bookingRepository.save(booking);
                    return ResponseEntity.ok(booking);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/counter-offer")
    public ResponseEntity<?> counterOffer(@PathVariable Long id, @RequestParam Double price, @RequestParam String status) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    booking.setEstimatedCost(price);
                    booking.setStatus(status);
                    bookingRepository.save(booking);
                    return ResponseEntity.ok(booking);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/upload-before")
    public ResponseEntity<?> uploadBefore(@PathVariable Long id, @RequestParam String photoUrl) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    booking.setBeforePhoto(photoUrl);
                    bookingRepository.save(booking);
                    return ResponseEntity.ok(booking);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/upload-after")
    public ResponseEntity<?> uploadAfter(@PathVariable Long id, @RequestParam String photoUrl) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    booking.setAfterPhoto(photoUrl);
                    bookingRepository.save(booking);
                    return ResponseEntity.ok(booking);
                }).orElse(ResponseEntity.notFound().build());
    }

    public static class BookingRequest {
        private Long customerId;
        private Long workerId;
        private String serviceType;
        private Double estimatedCost;
        private String description;

        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }

        public Long getWorkerId() { return workerId; }
        public void setWorkerId(Long workerId) { this.workerId = workerId; }

        public String getServiceType() { return serviceType; }
        public void setServiceType(String serviceType) { this.serviceType = serviceType; }

        public Double getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}

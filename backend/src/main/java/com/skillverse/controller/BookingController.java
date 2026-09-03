package com.skillverse.controller;

import com.skillverse.model.*;
import com.skillverse.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private static final double PLATFORM_COMMISSION_RATE = 0.05; // 5% platform commission
    private static final List<String> ACTIVE_JOB_STATUSES = List.of(
            "CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETION_REQUESTED"
    );

    private final ServiceBookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerWalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public BookingController(ServiceBookingRepository bookingRepository,
                             UserRepository userRepository,
                             WorkerWalletRepository walletRepository,
                             WalletTransactionRepository transactionRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        User customer = userRepository.findById(request.getCustomerId()).orElse(null);
        User worker = userRepository.findById(request.getWorkerId()).orElse(null);

        if (customer == null || worker == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid Customer or Worker ID"));
        }

        Double initialPrice = request.getEstimatedCost() != null ? request.getEstimatedCost() : 1000.0;

        ServiceBooking booking = new ServiceBooking();
        booking.setCustomer(customer);
        booking.setWorker(worker);
        booking.setServiceType(request.getServiceType());
        booking.setScheduledTime(LocalDateTime.now().plusDays(1));
        booking.setPreferredDate(request.getPreferredDate() != null ? request.getPreferredDate() : "Tomorrow");
        booking.setPreferredTime(request.getPreferredTime() != null ? request.getPreferredTime() : "10:00 AM");
        booking.setAddress(request.getAddress() != null ? request.getAddress() : customer.getAddress());
        booking.setDescription(request.getDescription());
        booking.setApplianceDetails(request.getApplianceDetails());
        booking.setBookingSource(request.getBookingSource() != null ? request.getBookingSource() : "DIRECT");

        booking.setEstimatedCost(initialPrice);
        booking.setCustomerOfferPrice(initialPrice);
        booking.setLastOfferedBy("CUSTOMER");
        booking.setAgreedCost(initialPrice);
        booking.setStatus("PENDING");

        // Generate OTPs
        Random random = new Random();
        booking.setStartVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setCompletionVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setLiveLocation("23.8103, 90.4125");

        ServiceBooking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ServiceBooking>> getCustomerBookings(@PathVariable Long customerId) {
        return ResponseEntity.ok(bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<ServiceBooking>> getWorkerBookings(@PathVariable Long workerId) {
        return ResponseEntity.ok(bookingRepository.findByWorkerIdOrderByCreatedAtDesc(workerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- HELPER: CHECK IF WORKER HAS ACTIVE JOB ---
    private boolean isWorkerBusy(Long workerId, Long currentBookingId) {
        if (workerId == null) return false;
        List<String> activeStatuses = List.of("CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETION_REQUESTED");
        List<ServiceBooking> workerBookings = bookingRepository.findByWorkerId(workerId);
        return workerBookings.stream()
                .anyMatch(b -> (currentBookingId == null || !b.getId().equals(currentBookingId))
                        && activeStatuses.contains(b.getStatus()));
    }

    // --- WORKER AVAILABILITY GUARDED ACCEPTANCE & PRICE AGREEMENT ---

    @PutMapping("/{id}/accept-price")
    public ResponseEntity<?> acceptPrice(@PathVariable Long id, @RequestParam String acceptedBy) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();

        // Enforce: Worker cannot accept if they already have an active job
        if (booking.getWorker() != null && isWorkerBusy(booking.getWorker().getId(), booking.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker already has an active job in progress. Complete or finalize the current job before accepting another."));
        }

        // Lock final price
        Double finalPrice = booking.getWorkerCounterPrice() != null ? booking.getWorkerCounterPrice() : booking.getEstimatedCost();
        booking.setAgreedCost(finalPrice);

        // Lock commission (5% Platform, 95% Worker)
        double commission = Math.round(finalPrice * PLATFORM_COMMISSION_RATE * 100.0) / 100.0;
        double netEarning = finalPrice - commission;
        booking.setPlatformCommission(commission);
        booking.setWorkerNetEarning(netEarning);

        booking.setStatus("CONFIRMED");
        ServiceBooking saved = bookingRepository.save(booking);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/counter-offer")
    public ResponseEntity<?> counterOffer(@PathVariable Long id, @RequestParam Double price, @RequestParam String offeredBy) {
        return bookingRepository.findById(id).map(booking -> {
            if ("WORKER".equalsIgnoreCase(offeredBy)) {
                booking.setWorkerCounterPrice(price);
                booking.setLastOfferedBy("WORKER");
            } else {
                booking.setCustomerOfferPrice(price);
                booking.setLastOfferedBy("CUSTOMER");
            }
            booking.setEstimatedCost(price);
            booking.setStatus("NEGOTIATING");
            bookingRepository.save(booking);
            return ResponseEntity.ok(booking);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- WORKER STATUS UPDATES WITH STATE MACHINE GUARDS ---

    @PutMapping("/{id}/on-the-way")
    public ResponseEntity<?> setOnTheWay(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus()) && !"ON_THE_WAY".equalsIgnoreCase(booking.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job must be CONFIRMED before starting journey."));
            }
            booking.setStatus("ON_THE_WAY");
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/arrived")
    public ResponseEntity<?> setArrived(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            if (!"ON_THE_WAY".equalsIgnoreCase(booking.getStatus()) && !"CONFIRMED".equalsIgnoreCase(booking.getStatus()) && !"ARRIVED".equalsIgnoreCase(booking.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job must be ON_THE_WAY before marking arrived."));
            }
            booking.setStatus("ARRIVED");
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- DUAL OTP VERIFICATION (START & COMPLETION) ---

    @PutMapping("/{id}/verify-start-otp")
    public ResponseEntity<?> verifyStartOtp(@PathVariable Long id, @RequestParam String otp) {
        return bookingRepository.findById(id).map(booking -> {
            if (booking.getStartVerificationCode() != null && booking.getStartVerificationCode().equals(otp.trim())) {
                booking.setStartOtpVerified(true);
                booking.setStatus("IN_PROGRESS");
                return ResponseEntity.ok(bookingRepository.save(booking));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid Start Service OTP code. Please verify with the customer."));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/upload-photos")
    public ResponseEntity<?> uploadPhotos(@PathVariable Long id, @RequestBody Map<String, String> photos) {
        return bookingRepository.findById(id).map(booking -> {
            if (photos.containsKey("beforePhoto")) {
                booking.setBeforePhoto(photos.get("beforePhoto"));
            }
            if (photos.containsKey("afterPhoto")) {
                booking.setAfterPhoto(photos.get("afterPhoto"));
            }
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/request-completion")
    public ResponseEntity<?> requestCompletion(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            if (!"IN_PROGRESS".equalsIgnoreCase(booking.getStatus()) && !Boolean.TRUE.equals(booking.getStartOtpVerified())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job must be IN_PROGRESS with verified start OTP before requesting completion."));
            }
            booking.setStatus("COMPLETION_REQUESTED");
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/verify-completion-otp")
    public ResponseEntity<?> verifyCompletionOtp(@PathVariable Long id, @RequestParam String otp) {
        return bookingRepository.findById(id).map(booking -> {
            if (booking.getCompletionVerificationCode() != null && booking.getCompletionVerificationCode().equals(otp.trim())) {
                booking.setCompletionOtpVerified(true);
                booking.setStatus("COMPLETED");
                return ResponseEntity.ok(bookingRepository.save(booking));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid Completion OTP code. Please verify with the customer."));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- CANCELLATION GUARD ---

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return bookingRepository.findById(id).map(booking -> {
            if ("IN_PROGRESS".equalsIgnoreCase(booking.getStatus()) || Boolean.TRUE.equals(booking.getStartOtpVerified())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Work has already started. This booking can no longer be cancelled."));
            }
            booking.setStatus("CANCELLED");
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- PAYMENT & WORKER WALLET LEDGER ---

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();
        String method = payload.getOrDefault("paymentMethod", "CASH");
        String txId = payload.getOrDefault("transactionId", "TXN-" + System.currentTimeMillis());

        Double agreedAmount = booking.getAgreedCost() != null ? booking.getAgreedCost() : booking.getEstimatedCost();
        double commission = Math.round(agreedAmount * PLATFORM_COMMISSION_RATE * 100.0) / 100.0;
        double netWorkerEarning = agreedAmount - commission;

        booking.setAgreedCost(agreedAmount);
        booking.setPlatformCommission(commission);
        booking.setWorkerNetEarning(netWorkerEarning);
        booking.setPaymentStatus("PAID");
        booking.setPaymentMethod(method);
        booking.setTransactionId(txId);
        booking.setPaidAt(LocalDateTime.now());
        booking.setStatus("PAID");

        ServiceBooking savedBooking = bookingRepository.save(booking);

        // Update Worker Wallet
        User worker = booking.getWorker();
        if (worker != null) {
            WorkerWallet wallet = walletRepository.findByWorkerId(worker.getId())
                    .orElseGet(() -> walletRepository.save(new WorkerWallet(worker)));

            if ("CASH".equalsIgnoreCase(method)) {
                // Customer paid cash to worker directly.
                // Deduct platform commission from worker balance.
                double newBalance = wallet.getBalance() - commission;
                wallet.setBalance(newBalance);
                wallet.setTotalPlatformFees(wallet.getTotalPlatformFees() + commission);
                if (newBalance < 0) {
                    wallet.setOutstandingFees(Math.abs(newBalance));
                } else {
                    wallet.setOutstandingFees(0.0);
                }
                walletRepository.save(wallet);

                transactionRepository.save(new WalletTransaction(
                        worker, "COD_PLATFORM_FEE", -commission,
                        "Platform 5% fee for COD Booking #" + booking.getId(), booking
                ));
            } else {
                // Digital Payment (bKash, Nagad, Rocket, Bank).
                // Customer paid online. Add net earning to worker balance.
                wallet.setBalance(wallet.getBalance() + netWorkerEarning);
                wallet.setTotalEarnings(wallet.getTotalEarnings() + netWorkerEarning);
                wallet.setTotalPlatformFees(wallet.getTotalPlatformFees() + commission);
                walletRepository.save(wallet);

                transactionRepository.save(new WalletTransaction(
                        worker, "SERVICE_EARNING", netWorkerEarning,
                        "Earning for Booking #" + booking.getId() + " (5% platform fee ৳" + commission + " deducted)", booking
                ));
            }
        }

        return ResponseEntity.ok(savedBooking);
    }

    // --- CUSTOMER REVIEW ---

    @PostMapping("/{id}/review")
    public ResponseEntity<?> submitReview(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return bookingRepository.findById(id).map(booking -> {
            Integer rating = Integer.parseInt(payload.getOrDefault("rating", "5").toString());
            String comment = payload.getOrDefault("comment", "").toString();

            booking.setReviewRating(rating);
            booking.setReviewComment(comment);
            booking.setReviewedAt(LocalDateTime.now());
            ServiceBooking saved = bookingRepository.save(booking);

            // Update Worker average rating
            User worker = booking.getWorker();
            if (worker != null) {
                List<ServiceBooking> workerBookings = bookingRepository.findByWorkerId(worker.getId());
                double avg = workerBookings.stream()
                        .filter(b -> b.getReviewRating() != null)
                        .mapToInt(ServiceBooking::getReviewRating)
                        .average()
                        .orElse(5.0);
                worker.setRating(Math.round(avg * 10.0) / 10.0);
                userRepository.save(worker);
            }

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class BookingRequest {
        private Long customerId;
        private Long workerId;
        private String serviceType;
        private Double estimatedCost;
        private String description;
        private String preferredDate;
        private String preferredTime;
        private String address;
        private String applianceDetails;
        private String bookingSource;

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

        public String getPreferredDate() { return preferredDate; }
        public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }

        public String getPreferredTime() { return preferredTime; }
        public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getApplianceDetails() { return applianceDetails; }
        public void setApplianceDetails(String applianceDetails) { this.applianceDetails = applianceDetails; }

        public String getBookingSource() { return bookingSource; }
        public void setBookingSource(String bookingSource) { this.bookingSource = bookingSource; }
    }
}

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

    private final ServiceBookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerWalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final PlatformSettingRepository settingRepository;
    private final NotificationRepository notificationRepository;
    private final WorkerAvailabilitySlotRepository slotRepository;

    public BookingController(ServiceBookingRepository bookingRepository,
                             UserRepository userRepository,
                             WorkerProfileRepository workerProfileRepository,
                             WorkerWalletRepository walletRepository,
                             WalletTransactionRepository transactionRepository,
                             PlatformSettingRepository settingRepository,
                             NotificationRepository notificationRepository,
                             WorkerAvailabilitySlotRepository slotRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.settingRepository = settingRepository;
        this.notificationRepository = notificationRepository;
        this.slotRepository = slotRepository;
    }

    private double getPlatformCommissionRate() {
        try {
            return settingRepository.findBySettingKey("platform_commission")
                    .map(s -> Double.parseDouble(s.getSettingValue()) / 100.0)
                    .orElse(0.05);
        } catch (Exception e) {
            return 0.05;
        }
    }

    private void sendNotification(User user, String title, String message, String type, Long referenceId) {
        if (user == null) return;
        try {
            notificationRepository.save(new Notification(user, title, message, type, referenceId));
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    private double calculateDistanceMeters(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 1500.0; // default 1.5 km
        }
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = 6371000.0 * c;
        return Math.max(500.0, Math.round(distance));
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        User customer = userRepository.findById(request.getCustomerId()).orElse(null);
        User worker = userRepository.findById(request.getWorkerId()).orElse(null);

        if (customer == null || worker == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid Customer or Worker ID"));
        }

        Double initialPrice = request.getEstimatedCost() != null ? request.getEstimatedCost() : 1000.0;

        // Fetch worker profile to get worker's set Base Price
        Double workerBasePrice = 300.0;
        Optional<WorkerProfile> profileOpt = workerProfileRepository.findByUserId(worker.getId());
        if (profileOpt.isPresent() && profileOpt.get().getBasePrice() != null) {
            workerBasePrice = profileOpt.get().getBasePrice();
        }

        ServiceBooking booking = new ServiceBooking();
        booking.setCustomer(customer);
        booking.setWorker(worker);
        booking.setServiceType(request.getServiceType());
        booking.setScheduledTime(LocalDateTime.now().plusDays(1));
        booking.setPreferredDate(request.getPreferredDate() != null ? request.getPreferredDate() : "Tomorrow");
        String serviceAddress = request.getAddress();
        if (serviceAddress == null || serviceAddress.trim().isEmpty()) {
            if (request.getDescription() != null && request.getDescription().contains("[Location:")) {
                try {
                    int startIdx = request.getDescription().indexOf("[Location:") + 10;
                    int endIdx = request.getDescription().indexOf("]", startIdx);
                    if (endIdx > startIdx) {
                        serviceAddress = request.getDescription().substring(startIdx, endIdx).trim();
                    }
                } catch (Exception ignored) {}
            }
        }
        if (serviceAddress == null || serviceAddress.trim().isEmpty()) {
            serviceAddress = customer.getAddress() != null ? customer.getAddress() : "Uttara Sector 12, Dhaka";
        }
        booking.setAddress(serviceAddress);
        booking.setDescription(request.getDescription());
        booking.setApplianceDetails(request.getApplianceDetails());
        booking.setBookingSource(request.getBookingSource() != null ? request.getBookingSource() : "DIRECT");
        booking.setBeforePhoto(request.getBeforePhoto());

        booking.setBasePrice(workerBasePrice);
        booking.setEstimatedCost(initialPrice);
        booking.setCustomerOfferPrice(initialPrice);
        booking.setLastOfferedBy("CUSTOMER");
        booking.setAgreedCost(null);
        booking.setStatus("PENDING");

        // Calculate distance & arrival timer (1 hour for every 1000m)
        double distance = calculateDistanceMeters(customer.getLatitude(), customer.getLongitude(), worker.getLatitude(), worker.getLongitude());
        double hours = Math.max(0.5, Math.round((distance / 1000.0) * 10.0) / 10.0);
        booking.setDistanceMeters(distance);
        booking.setArrivalTimeHours(hours);
        booking.setArrivalDeadline(LocalDateTime.now().plusMinutes((long) (hours * 60)));

        // Generate OTPs
        Random random = new Random();
        booking.setStartVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setCompletionVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setLiveLocation(worker.getLatitude() != null && worker.getLongitude() != null 
                ? worker.getLatitude() + ", " + worker.getLongitude() 
                : "23.8103, 90.4125");

        ServiceBooking saved = bookingRepository.save(booking);

        // If slotId is provided, mark slot as booked
        if (request.getSlotId() != null) {
            slotRepository.findById(request.getSlotId()).ifPresent(slot -> {
                slot.setBooked(true);
                slot.setBookingId(saved.getId());
                slotRepository.save(slot);
            });
        }

        // Notify Worker of incoming job booking
        sendNotification(worker, "New Booking Request",
                "Customer " + customer.getName() + " requested " + booking.getServiceType() + " with offer ৳" + initialPrice + " (Base Advance: ৳" + workerBasePrice + ").",
                "BOOKING_REQUEST", saved.getId());

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

    // --- HELPER: CHECK IF WORKER HAS UNRESOLVED WARRANTY CLAIM ---
    private boolean hasActiveWarrantyClaim(Long workerId) {
        if (workerId == null) return false;
        List<ServiceBooking> workerBookings = bookingRepository.findByWorkerId(workerId);
        return workerBookings.stream().anyMatch(b -> 
            "WARRANTY_CLAIMED".equalsIgnoreCase(b.getWarrantyStatus()) ||
            "WARRANTY_ACCEPTED".equalsIgnoreCase(b.getWarrantyStatus())
        );
    }

    // --- ACCEPT PRICE & TRANSITION (Worker accepts request -> Customer must pay base advance) ---

    @PutMapping("/{id}/accept-price")
    public ResponseEntity<?> acceptPrice(@PathVariable Long id, @RequestParam(required = false, defaultValue = "CUSTOMER") String acceptedBy) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();

        // Enforce: Worker must be verified by admin, not have active warranty claims, and not busy on another active job
        User worker = booking.getWorker();
        if ("WORKER".equalsIgnoreCase(acceptedBy) && worker != null) {
            boolean isVerifiedWorker = Boolean.TRUE.equals(worker.isVerified()) 
                    && !"SUSPENDED".equalsIgnoreCase(worker.getStatus()) 
                    && !"REJECTED".equalsIgnoreCase(worker.getStatus()) 
                    && !"BANNED".equalsIgnoreCase(worker.getStatus());
            if (!isVerifiedWorker) {
                return ResponseEntity.badRequest().body(Map.of("error", "Worker account is unverified or under review. Admin verification is required before accepting bookings."));
            }
            if (hasActiveWarrantyClaim(worker.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot accept new work. You have an active warranty claim that must be resolved first."));
            }
            if (!"ACTIVE".equalsIgnoreCase(worker.getStatus())) {
                worker.setStatus("ACTIVE");
                userRepository.save(worker);
            }
            if (isWorkerBusy(worker.getId(), booking.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Worker already has an active job in progress. Complete or finalize the current job before accepting another."));
            }
        }

        // Lock final agreed price
        Double finalPrice = booking.getLastOfferedBy() != null && "WORKER".equalsIgnoreCase(booking.getLastOfferedBy()) && booking.getWorkerCounterPrice() != null
                ? booking.getWorkerCounterPrice()
                : (booking.getCustomerOfferPrice() != null ? booking.getCustomerOfferPrice() : booking.getEstimatedCost());
        booking.setAgreedCost(finalPrice);
        booking.setEstimatedCost(finalPrice);

        // Lock commission
        double commissionRate = getPlatformCommissionRate();
        double commission = Math.round(finalPrice * commissionRate * 100.0) / 100.0;
        double netEarning = finalPrice - commission;
        booking.setPlatformCommission(commission);
        booking.setWorkerNetEarning(netEarning);

        // If advance has already been paid, transition directly to CONFIRMED. Otherwise, transition to AWAITING_ADVANCE.
        if (Boolean.TRUE.equals(booking.getAdvancePaid())) {
            booking.setStatus("CONFIRMED");
            booking.setArrivalDeadline(LocalDateTime.now().plusMinutes((long) (booking.getArrivalTimeHours() * 60)));
        } else {
            booking.setStatus("AWAITING_ADVANCE");
        }

        ServiceBooking saved = bookingRepository.save(booking);

        double base = saved.getBasePrice() != null ? saved.getBasePrice() : 300.0;
        double vat = Math.round(base * 0.05 * 100.0) / 100.0;

        if ("WORKER".equalsIgnoreCase(acceptedBy)) {
            sendNotification(booking.getCustomer(), "Technician Accepted Booking!",
                    (worker != null ? worker.getName() : "Technician") + " accepted your service deal for ৳" + finalPrice + ". Please pay the base advance ৳" + base + " (+৳" + vat + " 5% VAT) to confirm dispatch.",
                    "BOOKING_ACCEPTED", saved.getId());
        } else {
            sendNotification(booking.getWorker(), "Client Accepted Price Deal!",
                    (booking.getCustomer() != null ? booking.getCustomer().getName() : "Customer") + " confirmed agreed price of ৳" + finalPrice + ". Awaiting minimum advance payment.",
                    "PRICE_AGREED", saved.getId());
        }

        return ResponseEntity.ok(saved);
    }

    // --- COUNTER OFFER (Worker or Customer can counter; reflects immediately on both sides) ---

    @PutMapping("/{id}/counter-offer")
    public ResponseEntity<?> counterOffer(
            @PathVariable Long id, 
            @RequestParam Double price, 
            @RequestParam(required = false, defaultValue = "WORKER") String offeredBy,
            @RequestParam(required = false) String status) {
        return bookingRepository.findById(id).map(booking -> {
            if ("WORKER".equalsIgnoreCase(offeredBy)) {
                User worker = booking.getWorker();
                if (worker != null) {
                    boolean isVerifiedWorker = Boolean.TRUE.equals(worker.isVerified()) 
                            && !"SUSPENDED".equalsIgnoreCase(worker.getStatus()) 
                            && !"REJECTED".equalsIgnoreCase(worker.getStatus()) 
                            && !"BANNED".equalsIgnoreCase(worker.getStatus());
                    if (!isVerifiedWorker) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Worker is unverified. Admin verification required to submit counter-offers."));
                    }
                    if (hasActiveWarrantyClaim(worker.getId())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Cannot submit counter offers. You have an active warranty claim that must be resolved first."));
                    }
                    if (!"ACTIVE".equalsIgnoreCase(worker.getStatus())) {
                        worker.setStatus("ACTIVE");
                        userRepository.save(worker);
                    }
                }
                booking.setWorkerCounterPrice(price);
                booking.setLastOfferedBy("WORKER");
                booking.setEstimatedCost(price);
                booking.setAgreedCost(price);
                booking.setStatus("NEGOTIATING");
                bookingRepository.save(booking);

                sendNotification(booking.getCustomer(), "Technician Counter-Offer",
                        (worker != null ? worker.getName() : "Technician") + " proposed a counter offer of ৳" + price + " for " + booking.getServiceType() + ".",
                        "COUNTER_OFFER", booking.getId());
            } else {
                booking.setCustomerOfferPrice(price);
                booking.setLastOfferedBy("CUSTOMER");
                booking.setEstimatedCost(price);
                booking.setAgreedCost(price);
                booking.setStatus("NEGOTIATING");
                bookingRepository.save(booking);

                sendNotification(booking.getWorker(), "Customer Counter-Offer",
                        (booking.getCustomer() != null ? booking.getCustomer().getName() : "Customer") + " updated their offer to ৳" + price + " for " + booking.getServiceType() + ".",
                        "COUNTER_OFFER", booking.getId());
            }
            return ResponseEntity.ok(booking);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ADVANCE PAYMENT (Customer pays minimum base amount + 5% VAT to confirm booking) ---

    @PostMapping("/{id}/pay-advance")
    public ResponseEntity<?> payAdvance(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();
        String method = payload.getOrDefault("paymentMethod", "bKash").toString();
        String mobile = payload.getOrDefault("mobileNumber", "01700000000").toString();
        
        Double base = booking.getBasePrice() != null ? booking.getBasePrice() : 300.0;
        if (payload.containsKey("amount") && payload.get("amount") != null) {
            try { base = Double.parseDouble(payload.get("amount").toString()); } catch (Exception ignored) {}
        }
        Double vat = Math.round(base * 0.05 * 100.0) / 100.0;

        booking.setAdvancePaid(true);
        booking.setAdvancePaidAmount(base);
        booking.setAdvanceVatAmount(vat);
        booking.setAdvancePaymentMethod(method);
        booking.setAdvancePaymentMobile(mobile);
        booking.setAdvancePaidAt(LocalDateTime.now());
        booking.setStatus("CONFIRMED");

        // Set arrival deadline based on distance (1h per 1000m)
        double hours = booking.getArrivalTimeHours() != null ? booking.getArrivalTimeHours() : 1.5;
        booking.setArrivalDeadline(LocalDateTime.now().plusMinutes((long) (hours * 60)));

        ServiceBooking saved = bookingRepository.save(booking);

        // Notify Customer and Worker
        sendNotification(booking.getCustomer(), "Advance Payment Successful & Booking Confirmed!",
                "Paid ৳" + (base + vat) + " (Advance ৳" + base + " + 5% VAT ৳" + vat + ") via " + method + " (" + mobile + "). Direct call and chat now active!",
                "ADVANCE_PAID", saved.getId());

        sendNotification(booking.getWorker(), "Booking Confirmed! Base Advance Received",
                "Customer " + booking.getCustomer().getName() + " paid base advance fee. Booking #" + saved.getId() + " is confirmed. Please proceed to destination.",
                "ADVANCE_PAID", saved.getId());

        return ResponseEntity.ok(saved);
    }

    // --- TIMEOUT REJECTION & INSTANT CASHBACK REFUND ---

    @PostMapping("/{id}/timeout-refund")
    public ResponseEntity<?> timeoutRefund(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();
        if ("IN_PROGRESS".equalsIgnoreCase(booking.getStatus()) || Boolean.TRUE.equals(booking.getStartOtpVerified())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Service is already in progress. Cannot process timeout cancellation."));
        }

        double refundTotal = (booking.getAdvancePaidAmount() != null ? booking.getAdvancePaidAmount() : 0.0)
                + (booking.getAdvanceVatAmount() != null ? booking.getAdvanceVatAmount() : 0.0);
        if (refundTotal <= 0 && booking.getBasePrice() != null) {
            refundTotal = booking.getBasePrice() * 1.05;
        }

        String mobile = booking.getAdvancePaymentMobile() != null ? booking.getAdvancePaymentMobile() : "Customer Account";
        String method = booking.getAdvancePaymentMethod() != null ? booking.getAdvancePaymentMethod() : "Online Account";

        booking.setStatus("CANCELLED");
        booking.setIsRefunded(true);
        booking.setRefundAmount(refundTotal);
        booking.setRefundMobile(mobile);
        booking.setRefundedAt(LocalDateTime.now());

        ServiceBooking saved = bookingRepository.save(booking);

        // Notify customer of instant cashback refund
        sendNotification(booking.getCustomer(), "Instant Cashback Refund Processed!",
                "৳" + refundTotal + " has been instantly refunded to your " + method + " (" + mobile + ") due to technician arrival delay.",
                "TIMEOUT_REFUND", saved.getId());

        // Notify worker of cancellation
        sendNotification(booking.getWorker(), "Booking Cancelled (Arrival Timeout)",
                "Booking #" + saved.getId() + " was cancelled due to arrival time expiration. Client received instant refund.",
                "BOOKING_CANCELLED", saved.getId());

        return ResponseEntity.ok(saved);
    }

    // --- GENERAL STATUS UPDATE ENDPOINT ---
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus(status);
            if ("CONFIRMED".equalsIgnoreCase(status)) {
                booking.setAdvancePaid(true);
                double hours = booking.getArrivalTimeHours() != null ? booking.getArrivalTimeHours() : 1.5;
                booking.setArrivalDeadline(LocalDateTime.now().plusMinutes((long) (hours * 60)));
            }
            ServiceBooking saved = bookingRepository.save(booking);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- DELETE BOOKING ENDPOINT ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            bookingRepository.delete(booking);
            return ResponseEntity.ok(Map.of("message", "Booking #" + id + " successfully removed."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- WORKER JOURNEY & STATUS UPDATES ---

    @PutMapping("/{id}/on-the-way")
    public ResponseEntity<?> setOnTheWay(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus()) && !"ON_THE_WAY".equalsIgnoreCase(booking.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job must be CONFIRMED before starting journey."));
            }
            booking.setStatus("ON_THE_WAY");
            ServiceBooking saved = bookingRepository.save(booking);

            sendNotification(booking.getCustomer(), "Technician Is On The Way!",
                    (booking.getWorker() != null ? booking.getWorker().getName() : "Technician") + " started journey. Expected arrival within " + (booking.getArrivalTimeHours() != null ? booking.getArrivalTimeHours() : 1.5) + " hours.",
                    "ON_THE_WAY", saved.getId());

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/arrived")
    public ResponseEntity<?> setArrived(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            if (!"ON_THE_WAY".equalsIgnoreCase(booking.getStatus()) && !"CONFIRMED".equalsIgnoreCase(booking.getStatus()) && !"ARRIVED".equalsIgnoreCase(booking.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job must be ON_THE_WAY before marking arrived."));
            }
            booking.setStatus("ARRIVED");
            ServiceBooking saved = bookingRepository.save(booking);

            sendNotification(booking.getCustomer(), "Technician Arrived At Doorstep!",
                    (booking.getWorker() != null ? booking.getWorker().getName() : "Technician") + " is at your location. Please share your Start OTP: " + booking.getStartVerificationCode() + " to start work.",
                    "ARRIVED", saved.getId());

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- START OTP VERIFICATION (Only Start OTP is required) ---

    @PutMapping("/{id}/verify-start-otp")
    public ResponseEntity<?> verifyStartOtp(@PathVariable Long id, @RequestParam String otp) {
        return bookingRepository.findById(id).map(booking -> {
            if (booking.getStartVerificationCode() != null && booking.getStartVerificationCode().equals(otp.trim())) {
                booking.setStartOtpVerified(true);
                booking.setStatus("IN_PROGRESS");
                ServiceBooking saved = bookingRepository.save(booking);

                sendNotification(booking.getCustomer(), "Service In Progress",
                        "Start OTP verified. Work is now underway for " + booking.getServiceType() + ".",
                        "IN_PROGRESS", saved.getId());

                return ResponseEntity.ok(saved);
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

    @PutMapping("/{id}/upload-before")
    public ResponseEntity<?> uploadBeforePhoto(@PathVariable Long id, @RequestParam String photoUrl) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setBeforePhoto(photoUrl);
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/request-completion")
    public ResponseEntity<?> requestCompletion(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("COMPLETION_REQUESTED");
            ServiceBooking saved = bookingRepository.save(booking);

            sendNotification(booking.getCustomer(), "Service Completed — Please Pay",
                    "Technician finished service for " + booking.getServiceType() + ". Please inspect and complete payment.",
                    "COMPLETION_REQUESTED", saved.getId());

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- CANCELLATION ---

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return bookingRepository.findById(id).map(booking -> {
            if ("IN_PROGRESS".equalsIgnoreCase(booking.getStatus()) || Boolean.TRUE.equals(booking.getStartOtpVerified())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Work has already started. This booking can no longer be cancelled."));
            }
            booking.setStatus("CANCELLED");
            ServiceBooking saved = bookingRepository.save(booking);

            if (booking.getWorker() != null) {
                sendNotification(booking.getWorker(), "Booking Cancelled",
                        "Booking #" + saved.getId() + " was cancelled by client.",
                        "CANCELLED", saved.getId());
            }
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- FINAL PAYMENT & COMPLETION (Direct payment, no completion OTP required, custom amounts supported) ---

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();
        String method = payload.getOrDefault("paymentMethod", "bKash").toString();
        String mobile = payload.getOrDefault("mobileNumber", "01700000000").toString();
        String txId = payload.getOrDefault("transactionId", "TXN-" + System.currentTimeMillis()).toString();

        // Allow customer to pay different amount (more or less) as agreed / adjusted
        Double payableAmount = booking.getAgreedCost() != null ? booking.getAgreedCost() : booking.getEstimatedCost();
        if (payload.containsKey("finalAmount") && payload.get("finalAmount") != null) {
            try { payableAmount = Double.parseDouble(payload.get("finalAmount").toString()); } catch (Exception ignored) {}
        } else if (payload.containsKey("amount") && payload.get("amount") != null) {
            try { payableAmount = Double.parseDouble(payload.get("amount").toString()); } catch (Exception ignored) {}
        }

        double commissionRate = getPlatformCommissionRate();
        double commission = Math.round(payableAmount * commissionRate * 100.0) / 100.0;
        double netWorkerEarning = payableAmount - commission;

        booking.setAgreedCost(payableAmount);
        booking.setFinalPaymentAmount(payableAmount);
        booking.setFinalPaymentMobile(mobile);
        booking.setPlatformCommission(commission);
        booking.setWorkerNetEarning(netWorkerEarning);
        booking.setPaymentStatus("PAID");
        booking.setPaymentMethod(method);
        booking.setTransactionId(txId);
        booking.setPaidAt(LocalDateTime.now());
        booking.setStatus("COMPLETED"); // Direct completion upon payment!
        if (booking.getCompletedAt() == null) {
            booking.setCompletedAt(LocalDateTime.now());
        }
        if (booking.getWarrantyStatus() == null) {
            booking.setWarrantyStatus("ELIGIBLE");
        }
        booking.setCompletionOtpVerified(true);

        ServiceBooking savedBooking = bookingRepository.save(booking);

        // Update Worker Wallet
        User worker = booking.getWorker();
        if (worker != null) {
            WorkerWallet wallet = walletRepository.findByWorkerId(worker.getId())
                    .orElseGet(() -> walletRepository.save(new WorkerWallet(worker)));

            if ("CASH".equalsIgnoreCase(method)) {
                double currentBal = wallet.getBalance() != null ? Math.max(0.0, wallet.getBalance()) : 0.0;
                double coverable = Math.min(currentBal, commission);
                double newBalance = Math.max(0.0, currentBal - coverable);
                double remainingFee = commission - coverable;

                wallet.setBalance(newBalance);
                wallet.setTotalPlatformFees((wallet.getTotalPlatformFees() != null ? wallet.getTotalPlatformFees() : 0.0) + commission);
                wallet.setOutstandingFees((wallet.getOutstandingFees() != null ? wallet.getOutstandingFees() : 0.0) + remainingFee);
                walletRepository.save(wallet);

                transactionRepository.save(new WalletTransaction(
                        worker, "COD_PLATFORM_FEE", -commission,
                        "Platform fee for COD Booking #" + booking.getId() + " (৳" + commission + ")", booking
                ));
            } else {
                double currentBal = wallet.getBalance() != null ? Math.max(0.0, wallet.getBalance()) : 0.0;
                double outstanding = wallet.getOutstandingFees() != null ? wallet.getOutstandingFees() : 0.0;
                
                double settledFees = Math.min(outstanding, netWorkerEarning);
                double remainingOutstanding = outstanding - settledFees;
                double netCredit = netWorkerEarning - settledFees;
                double newBalance = Math.max(0.0, currentBal + netCredit);

                wallet.setBalance(newBalance);
                wallet.setOutstandingFees(remainingOutstanding);
                wallet.setTotalEarnings((wallet.getTotalEarnings() != null ? wallet.getTotalEarnings() : 0.0) + netWorkerEarning);
                wallet.setTotalPlatformFees((wallet.getTotalPlatformFees() != null ? wallet.getTotalPlatformFees() : 0.0) + commission);
                walletRepository.save(wallet);

                transactionRepository.save(new WalletTransaction(
                        worker, "SERVICE_EARNING", netWorkerEarning,
                        "Earning for Booking #" + booking.getId() + " (৳" + payableAmount + " paid via " + method + (settledFees > 0 ? ", ৳" + settledFees + " settled past dues" : "") + ")", booking
                ));
            }

            // Send notification to Worker
            sendNotification(worker, "Payment Received & Job Completed!",
                    "৳" + payableAmount + " paid by " + booking.getCustomer().getName() + " via " + method + " (" + mobile + "). Net ৳" + netWorkerEarning + " credited to wallet.",
                    "PAYMENT_RECEIVED", savedBooking.getId());
        }

        // Send notification to Customer
        sendNotification(booking.getCustomer(), "Payment Successful & Job Finalized!",
                "৳" + payableAmount + " successfully paid to technician via " + method + " (" + mobile + "). Service contract finalized.",
                "PAYMENT_SUCCESS", savedBooking.getId());

        return ResponseEntity.ok(savedBooking);
    }

    // --- CUSTOMER REVIEW & DYNAMIC WORKER REVIEWS ---

    @PostMapping("/{id}/review")
    public ResponseEntity<?> submitReview(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return bookingRepository.findById(id).map(booking -> {
            if (booking.getReviewRating() != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Review has already been submitted for this service booking. Reviews cannot be edited once submitted."));
            }

            Integer rating = Integer.parseInt(payload.getOrDefault("rating", "5").toString());
            String comment = payload.getOrDefault("comment", "").toString();

            booking.setReviewRating(rating);
            booking.setReviewComment(comment);
            booking.setReviewedAt(LocalDateTime.now());
            ServiceBooking saved = bookingRepository.save(booking);

            // Update Worker average rating dynamically
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

                sendNotification(worker, "New Customer Review Received!",
                        booking.getCustomer().getName() + " rated you ⭐ " + rating + "/5 stars: \"" + comment + "\"",
                        "REVIEW_RECEIVED", saved.getId());
            }

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reviews/worker/{workerId}")
    public ResponseEntity<List<Map<String, Object>>> getWorkerReviews(@PathVariable Long workerId) {
        List<ServiceBooking> bookings = bookingRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
        List<Map<String, Object>> reviews = new ArrayList<>();
        for (ServiceBooking b : bookings) {
            if (b.getReviewRating() != null) {
                Map<String, Object> rev = new HashMap<>();
                rev.put("bookingId", b.getId());
                rev.put("serviceType", b.getServiceType());
                rev.put("rating", b.getReviewRating());
                String commentText = (b.getReviewComment() != null && !b.getReviewComment().trim().isEmpty())
                        ? b.getReviewComment().trim()
                        : "Great service quality!";
                rev.put("comment", commentText);
                rev.put("reviewComment", commentText);
                rev.put("reviewedAt", b.getReviewedAt() != null ? b.getReviewedAt() : b.getCreatedAt());
                rev.put("scheduledTime", b.getScheduledTime());
                String custName = b.getCustomer() != null ? b.getCustomer().getName() : "Verified Customer";
                String custPhoto = b.getCustomer() != null ? b.getCustomer().getProfilePicture() : null;
                rev.put("customerName", custName);
                rev.put("customerPhoto", custPhoto);

                Map<String, Object> custMap = new HashMap<>();
                custMap.put("name", custName);
                custMap.put("profilePicture", custPhoto);
                rev.put("customer", custMap);

                reviews.add(rev);
            }
        }
        return ResponseEntity.ok(reviews);
    }

    // ==========================================
    // --- 30-DAY WARRANTY SERVICE CLAIM FLOW ---
    // ==========================================

    @PostMapping("/{id}/claim-warranty")
    public ResponseEntity<?> claimWarranty(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();
        if (!"COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Warranty can only be claimed on completed bookings."));
        }

        if (Boolean.TRUE.equals(booking.getWarrantyClaimed())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Warranty has already been claimed for this booking. Only 1 warranty claim is allowed."));
        }

        // Check 30-day warranty window
        LocalDateTime completionDate = booking.getCompletedAt() != null 
                ? booking.getCompletedAt() 
                : (booking.getPaidAt() != null ? booking.getPaidAt() : booking.getUpdatedAt());
        if (completionDate == null) {
            completionDate = booking.getCreatedAt();
        }

        if (completionDate != null && completionDate.plusDays(30).isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Warranty period (30 days) has expired for this booking."));
        }

        String problemDesc = payload != null && payload.containsKey("description") && payload.get("description") != null
                ? payload.get("description").toString()
                : "Recurring problem reported under 30-day service warranty.";

        booking.setWarrantyClaimed(true);
        booking.setWarrantyStatus("WARRANTY_CLAIMED");
        booking.setWarrantyClaimedAt(LocalDateTime.now());
        booking.setWarrantyProblemDescription(problemDesc);

        ServiceBooking saved = bookingRepository.save(booking);

        // Notify Worker (Urgent: worker cannot accept new work until resolved)
        User worker = booking.getWorker();
        if (worker != null) {
            String custName = booking.getCustomer() != null ? booking.getCustomer().getName() : "Customer";
            sendNotification(worker, "🚨 Urgent: Warranty Claim Received!",
                    "Customer " + custName + " has reported a recurring issue for " + booking.getServiceType() + " under 30-day warranty. You must accept and service this claim free of charge.",
                    "WARRANTY_CLAIMED", saved.getId());
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/accept-warranty")
    public ResponseEntity<?> acceptWarranty(@PathVariable Long id) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();
        if (!"WARRANTY_CLAIMED".equalsIgnoreCase(booking.getWarrantyStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No pending warranty claim found to accept."));
        }

        booking.setWarrantyStatus("WARRANTY_ACCEPTED");
        booking.setWarrantyAcceptedAt(LocalDateTime.now());

        ServiceBooking saved = bookingRepository.save(booking);

        // Notify Customer
        User customer = booking.getCustomer();
        User worker = booking.getWorker();
        if (customer != null) {
            String workerName = worker != null ? worker.getName() : "Technician";
            sendNotification(customer, "Warranty Claim Accepted by Technician",
                    workerName + " has accepted your warranty claim for " + booking.getServiceType() + " and will visit your address free of charge.",
                    "WARRANTY_ACCEPTED", saved.getId());
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/complete-warranty")
    public ResponseEntity<?> completeWarranty(@PathVariable Long id) {
        Optional<ServiceBooking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceBooking booking = optionalBooking.get();
        if (!"WARRANTY_ACCEPTED".equalsIgnoreCase(booking.getWarrantyStatus()) && !"WARRANTY_CLAIMED".equalsIgnoreCase(booking.getWarrantyStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Warranty is not in an active claim state."));
        }

        booking.setWarrantyStatus("WARRANTY_COMPLETED");
        booking.setWarrantyCompletedAt(LocalDateTime.now());

        ServiceBooking saved = bookingRepository.save(booking);

        // Notify Worker (Work restriction lifted!)
        User worker = booking.getWorker();
        User customer = booking.getCustomer();
        if (worker != null) {
            String custName = customer != null ? customer.getName() : "Customer";
            sendNotification(worker, "Warranty Service Completed!",
                    "Customer " + custName + " has confirmed that the warranty work for " + booking.getServiceType() + " is completed. Your work restriction is lifted.",
                    "WARRANTY_COMPLETED", saved.getId());
        }

        return ResponseEntity.ok(saved);
    }

    public static class BookingRequest {
        private Long customerId;
        private Long workerId;
        private String serviceType;
        private Double estimatedCost;
        private Double basePrice;
        private String description;
        private String preferredDate;
        private String preferredTime;
        private String address;
        private String applianceDetails;
        private String bookingSource;
        private String beforePhoto;
        private Long slotId;

        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }

        public Long getWorkerId() { return workerId; }
        public void setWorkerId(Long workerId) { this.workerId = workerId; }

        public String getServiceType() { return serviceType; }
        public void setServiceType(String serviceType) { this.serviceType = serviceType; }

        public Double getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

        public Double getBasePrice() { return basePrice; }
        public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

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

        public String getBeforePhoto() { return beforePhoto; }
        public void setBeforePhoto(String beforePhoto) { this.beforePhoto = beforePhoto; }

        public Long getSlotId() { return slotId; }
        public void setSlotId(Long slotId) { this.slotId = slotId; }
    }
}

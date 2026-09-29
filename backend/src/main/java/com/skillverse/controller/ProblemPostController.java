package com.skillverse.controller;

import com.skillverse.model.*;
import com.skillverse.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = "*")
public class ProblemPostController {

    private final ProblemPostRepository problemPostRepository;
    private final ProblemOfferRepository problemOfferRepository;
    private final ServiceBookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PlatformSettingRepository settingRepository;

    public ProblemPostController(ProblemPostRepository problemPostRepository,
                                 ProblemOfferRepository problemOfferRepository,
                                 ServiceBookingRepository bookingRepository,
                                 UserRepository userRepository,
                                 PlatformSettingRepository settingRepository) {
        this.problemPostRepository = problemPostRepository;
        this.problemOfferRepository = problemOfferRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
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

    @PostMapping
    public ResponseEntity<?> createProblemPost(@RequestBody Map<String, Object> req) {
        Long customerId = Long.valueOf(req.get("customerId").toString());
        User customer = userRepository.findById(customerId).orElse(null);
        if (customer == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Customer not found"));
        }

        ProblemPost post = new ProblemPost();
        post.setCustomer(customer);
        post.setServiceCategory(req.getOrDefault("serviceCategory", "General Maintenance").toString());
        post.setTitle(req.getOrDefault("title", "Service Problem Request").toString());
        post.setDescription(req.getOrDefault("description", "").toString());
        post.setApplianceInfo(req.getOrDefault("applianceInfo", "").toString());
        post.setPhotoUrl(req.getOrDefault("photoUrl", "").toString());
        post.setPreferredDate(req.getOrDefault("preferredDate", "Tomorrow").toString());
        post.setPreferredTime(req.getOrDefault("preferredTime", "10:00 AM - 12:00 PM").toString());
        post.setAddress(req.getOrDefault("address", customer.getAddress()).toString());
        post.setBudgetPrice(Double.valueOf(req.getOrDefault("budgetPrice", "1000").toString()));
        post.setStatus("OPEN");

        ProblemPost saved = problemPostRepository.save(post);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<ProblemPost>> getAllOpenProblems() {
        return ResponseEntity.ok(problemPostRepository.findByStatusOrderByCreatedAtDesc("OPEN"));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ProblemPost>> getCustomerProblems(@PathVariable Long customerId) {
        return ResponseEntity.ok(problemPostRepository.findByCustomerIdOrderByCreatedAtDesc(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblemById(@PathVariable Long id) {
        return problemPostRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- WORKER OFFERS ON POSTED PROBLEMS ---

    @PostMapping("/{id}/offers")
    public ResponseEntity<?> submitOffer(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        Optional<ProblemPost> optionalPost = problemPostRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProblemPost post = optionalPost.get();
        Long workerId = Long.valueOf(req.get("workerId").toString());
        User worker = userRepository.findById(workerId).orElse(null);
        if (worker == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker not found"));
        }

        boolean isVerifiedWorker = Boolean.TRUE.equals(worker.isVerified()) 
                && !"SUSPENDED".equalsIgnoreCase(worker.getStatus()) 
                && !"REJECTED".equalsIgnoreCase(worker.getStatus()) 
                && !"BANNED".equalsIgnoreCase(worker.getStatus());
        if (!isVerifiedWorker) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker is unverified or under review. Admin verification is required to submit quotes on problem posts."));
        }
        if (!"ACTIVE".equalsIgnoreCase(worker.getStatus())) {
            worker.setStatus("ACTIVE");
            userRepository.save(worker);
        }

        // Check if worker already has an active job in progress
        List<String> activeStatuses = List.of("CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETION_REQUESTED");
        List<ServiceBooking> workerBookings = bookingRepository.findByWorkerId(workerId);
        boolean isBusy = workerBookings.stream().anyMatch(b -> activeStatuses.contains(b.getStatus()));
        if (isBusy) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker already has an active job in progress. Complete or finalize the current job before submitting offers on new problems."));
        }

        Double price = Double.valueOf(req.get("proposedPrice").toString());
        String msg = req.getOrDefault("message", "").toString();
        String arrival = req.getOrDefault("estimatedArrival", "Within 2 hours").toString();

        Optional<ProblemOffer> existingOffer = problemOfferRepository.findByProblemPostIdAndWorkerId(id, workerId);
        ProblemOffer offer;
        if (existingOffer.isPresent()) {
            offer = existingOffer.get();
            offer.setProposedPrice(price);
            offer.setMessage(msg);
            offer.setEstimatedArrival(arrival);
            offer.setStatus("PENDING");
        } else {
            offer = new ProblemOffer(post, worker, price, msg, arrival);
        }

        return ResponseEntity.ok(problemOfferRepository.save(offer));
    }

    @GetMapping("/{id}/offers")
    public ResponseEntity<List<ProblemOffer>> getOffersForProblem(@PathVariable Long id) {
        return ResponseEntity.ok(problemOfferRepository.findByProblemPostId(id));
    }

    @GetMapping("/offers/worker/{workerId}")
    public ResponseEntity<List<ProblemOffer>> getOffersForWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(problemOfferRepository.findByWorkerId(workerId));
    }

    // --- ACCEPT OFFER & CONVERGE INTO UNIFIED BOOKING LIFECYCLE ---

    @PutMapping("/offers/{offerId}/accept")
    public ResponseEntity<?> acceptOffer(@PathVariable Long offerId) {
        Optional<ProblemOffer> optionalOffer = problemOfferRepository.findById(offerId);
        if (optionalOffer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProblemOffer acceptedOffer = optionalOffer.get();
        ProblemPost post = acceptedOffer.getProblemPost();
        User worker = acceptedOffer.getWorker();

        boolean isVerifiedWorker = worker != null && Boolean.TRUE.equals(worker.isVerified()) 
                && !"SUSPENDED".equalsIgnoreCase(worker.getStatus()) 
                && !"REJECTED".equalsIgnoreCase(worker.getStatus()) 
                && !"BANNED".equalsIgnoreCase(worker.getStatus());
        if (!isVerifiedWorker) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot assign problem to an unverified technician."));
        }
        if (worker != null && !"ACTIVE".equalsIgnoreCase(worker.getStatus())) {
            worker.setStatus("ACTIVE");
            userRepository.save(worker);
        }

        // Check if technician currently has an active job in progress
        List<String> activeStatuses = List.of("CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETION_REQUESTED");
        List<ServiceBooking> workerBookings = bookingRepository.findByWorkerId(worker.getId());
        boolean isBusy = workerBookings.stream().anyMatch(b -> activeStatuses.contains(b.getStatus()));
        if (isBusy) {
            return ResponseEntity.badRequest().body(Map.of("error", "This technician currently has an active job in progress and cannot accept new jobs at this time."));
        }

        acceptedOffer.setStatus("ACCEPTED");
        problemOfferRepository.save(acceptedOffer);

        post.setStatus("ASSIGNED");
        problemPostRepository.save(post);

        // Convert Method 2 into Common ServiceBooking Entity!
        Double agreedPrice = acceptedOffer.getProposedPrice();
        double commissionRate = getPlatformCommissionRate();
        double commission = Math.round(agreedPrice * commissionRate * 100.0) / 100.0;
        double netEarning = agreedPrice - commission;

        ServiceBooking booking = new ServiceBooking();
        booking.setCustomer(post.getCustomer());
        booking.setWorker(worker);
        booking.setServiceType(post.getServiceCategory());
        booking.setBookingSource("POSTED_PROBLEM");
        booking.setScheduledTime(LocalDateTime.now().plusDays(1));
        booking.setPreferredDate(post.getPreferredDate());
        booking.setPreferredTime(post.getPreferredTime());
        booking.setAddress(post.getAddress());
        booking.setDescription(post.getTitle() + " — " + post.getDescription());
        booking.setApplianceDetails(post.getApplianceInfo());
        booking.setBeforePhoto(post.getPhotoUrl());

        booking.setEstimatedCost(agreedPrice);
        booking.setCustomerOfferPrice(post.getBudgetPrice());
        booking.setWorkerCounterPrice(agreedPrice);
        booking.setAgreedCost(agreedPrice);
        booking.setPlatformCommission(commission);
        booking.setWorkerNetEarning(netEarning);

        booking.setStatus("CONFIRMED");

        Random random = new Random();
        booking.setStartVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setCompletionVerificationCode(String.format("%04d", random.nextInt(10000)));
        booking.setLiveLocation("23.8103, 90.4125");

        ServiceBooking savedBooking = bookingRepository.save(booking);

        // Reject other pending offers
        List<ProblemOffer> allOffers = problemOfferRepository.findByProblemPostId(post.getId());
        for (ProblemOffer o : allOffers) {
            if (!o.getId().equals(offerId)) {
                o.setStatus("DECLINED");
                problemOfferRepository.save(o);
            }
        }

        return ResponseEntity.ok(savedBooking);
    }
}

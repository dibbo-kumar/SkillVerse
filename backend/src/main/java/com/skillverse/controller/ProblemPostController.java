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

    public ProblemPostController(ProblemPostRepository problemPostRepository,
                                 ProblemOfferRepository problemOfferRepository,
                                 ServiceBookingRepository bookingRepository,
                                 UserRepository userRepository) {
        this.problemPostRepository = problemPostRepository;
        this.problemOfferRepository = problemOfferRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
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

        // Auto-generate competitive technician quotes from registered technicians in the platform
        List<User> workers = userRepository.findAll().stream()
                .filter(u -> "WORKER".equalsIgnoreCase(u.getRole()))
                .limit(2)
                .toList();

        if (workers.size() >= 1) {
            User w1 = workers.get(0);
            ProblemOffer off1 = new ProblemOffer();
            off1.setProblemPost(saved);
            off1.setWorker(w1);
            off1.setProposedPrice(Math.round(saved.getBudgetPrice() * 0.95 * 100.0) / 100.0);
            off1.setMessage("Hello! I am a verified technician available at your requested time. I will bring standard replacement parts and professional tools.");
            off1.setEstimatedArrival("Within 45-60 mins");
            off1.setStatus("PENDING");
            problemOfferRepository.save(off1);
        }

        if (workers.size() >= 2) {
            User w2 = workers.get(1);
            ProblemOffer off2 = new ProblemOffer();
            off2.setProblemPost(saved);
            off2.setWorker(w2);
            off2.setProposedPrice(Math.round(saved.getBudgetPrice() * 1.05 * 100.0) / 100.0);
            off2.setMessage("Certified specialist with 8+ years experience. Quality guarantee with 30-day post-service warranty on all repairs.");
            off2.setEstimatedArrival("Same day available");
            off2.setStatus("PENDING");
            problemOfferRepository.save(off2);
        }

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

        // Enforce: Worker cannot take job if already has active job
        List<String> activeStatuses = List.of("CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETION_REQUESTED");
        boolean isBusy = bookingRepository.findByWorkerId(worker.getId()).stream()
                .anyMatch(b -> activeStatuses.contains(b.getStatus()));
        if (isBusy) {
            return ResponseEntity.badRequest().body(Map.of("error", "This technician currently has an active job in progress. Please choose another technician or wait until they finish."));
        }

        acceptedOffer.setStatus("ACCEPTED");
        problemOfferRepository.save(acceptedOffer);

        post.setStatus("ASSIGNED");
        problemPostRepository.save(post);

        // Convert Method 2 into Common ServiceBooking Entity!
        Double agreedPrice = acceptedOffer.getProposedPrice();
        double commission = Math.round(agreedPrice * 0.05 * 100.0) / 100.0;
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

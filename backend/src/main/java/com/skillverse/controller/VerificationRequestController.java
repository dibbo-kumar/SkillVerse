package com.skillverse.controller;

import com.skillverse.model.User;
import com.skillverse.model.VerificationRequest;
import com.skillverse.repository.UserRepository;
import com.skillverse.repository.VerificationRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*")
public class VerificationRequestController {

    private final VerificationRequestRepository verificationRepository;
    private final UserRepository userRepository;

    public VerificationRequestController(VerificationRequestRepository verificationRepository, UserRepository userRepository) {
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
    }

    // Submit NID verification request (Worker side)
    @PostMapping("/submit")
    public ResponseEntity<?> submitVerification(@RequestParam Long userId, 
                                               @RequestParam String nidNumber,
                                               @RequestParam(required = false) String frontPhoto,
                                               @RequestParam(required = false) String backPhoto) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setNidNumber(nidNumber);
        userRepository.save(user);

        // Check if there is already a pending request
        VerificationRequest existing = verificationRepository.findByUserIdAndStatus(userId, "PENDING").orElse(null);
        if (existing != null) {
            existing.setNidNumber(nidNumber);
            if (frontPhoto != null && !frontPhoto.isEmpty()) existing.setNidFrontPhoto(frontPhoto);
            if (backPhoto != null && !backPhoto.isEmpty()) existing.setNidBackPhoto(backPhoto);
            existing.setSubmittedAt(LocalDateTime.now());
            verificationRepository.save(existing);
            return ResponseEntity.ok(existing);
        }

        VerificationRequest req = new VerificationRequest(user, nidNumber, 
            (frontPhoto != null && !frontPhoto.isEmpty()) ? frontPhoto : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300", 
            (backPhoto != null && !backPhoto.isEmpty()) ? backPhoto : "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300");
        
        VerificationRequest saved = verificationRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    // Get all pending requests (Admin side)
    @GetMapping("/pending")
    public ResponseEntity<List<VerificationRequest>> getPendingRequests() {
        return ResponseEntity.ok(verificationRepository.findByStatus("PENDING"));
    }

    // Get requests by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VerificationRequest>> getUserRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(verificationRepository.findByUserId(userId));
    }

    // Approve verification request (Admin side)
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveVerification(@PathVariable Long id) {
        return verificationRepository.findById(id)
                .map(req -> {
                    req.setStatus("APPROVED");
                    verificationRepository.save(req);

                    User user = req.getUser();
                    if (user != null) {
                        user.setVerified(true);
                        user.setNidNumber(req.getNidNumber());
                        userRepository.save(user);
                    }
                    return ResponseEntity.ok(req);
                }).orElse(ResponseEntity.notFound().build());
    }

    // Reject verification request (Admin side)
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectVerification(@PathVariable Long id) {
        return verificationRepository.findById(id)
                .map(req -> {
                    req.setStatus("REJECTED");
                    verificationRepository.save(req);

                    User user = req.getUser();
                    if (user != null) {
                        user.setVerified(false);
                        userRepository.save(user);
                    }
                    return ResponseEntity.ok(req);
                }).orElse(ResponseEntity.notFound().build());
    }
}

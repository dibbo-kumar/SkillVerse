package com.skillverse.controller;

import com.skillverse.model.User;
import com.skillverse.model.VerificationRequest;
import com.skillverse.repository.UserRepository;
import com.skillverse.repository.WorkerProfileRepository;
import com.skillverse.repository.VerificationRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final VerificationRequestRepository verificationRequestRepository;

    public AuthController(UserRepository userRepository,
            WorkerProfileRepository workerProfileRepository,
            VerificationRequestRepository verificationRequestRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.verificationRequestRepository = verificationRequestRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        if ("WORKER".equalsIgnoreCase(user.getRole())) {
            user.setVerified(false);
            user.setStatus("UNVERIFIED");
        } else if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            user.setVerified(true);
            user.setStatus("ACTIVE");
        } else {
            user.setVerified(true);
            user.setStatus("ACTIVE");
        }
        User saved = userRepository.save(user);
        if ("WORKER".equalsIgnoreCase(saved.getRole())) {
            com.skillverse.model.WorkerProfile profile = new com.skillverse.model.WorkerProfile(
                    saved,
                    "Electrical, Plumbing",
                    1,
                    "Dhaka North (Gulshan, Banani, Uttara)",
                    "Bronze",
                    350.0);
            profile.setAvailable(true);
            workerProfileRepository.save(profile);
        }
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body("Error: Invalid email or password");
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User profile) {
        return userRepository.findById(id)
                .map(user -> {
                    // Update standard personal info immediately (No admin approval needed)
                    if (profile.getName() != null)
                        user.setName(profile.getName());
                    if (profile.getEmail() != null)
                        user.setEmail(profile.getEmail());
                    if (profile.getPhone() != null)
                        user.setPhone(profile.getPhone());
                    if (profile.getProfilePicture() != null)
                        user.setProfilePicture(profile.getProfilePicture());
                    if (profile.getAddress() != null)
                        user.setAddress(profile.getAddress());
                    if (profile.getLatitude() != null)
                        user.setLatitude(profile.getLatitude());
                    if (profile.getLongitude() != null)
                        user.setLongitude(profile.getLongitude());

                    // NID Number Change Rule:
                    // If NID Number is changed, create/update a PENDING Verification Request for
                    // Admin review & approval!
                    if (profile.getNidNumber() != null && !profile.getNidNumber().trim().isEmpty()) {
                        String newNid = profile.getNidNumber().trim();
                        String currentNid = user.getNidNumber();

                        if (currentNid == null || !currentNid.equals(newNid)) {
                            VerificationRequest req = verificationRequestRepository
                                    .findTopByUserIdOrderBySubmittedAtDesc(user.getId())
                                    .orElse(new VerificationRequest());

                            req.setUser(user);
                            req.setFullName(user.getName());
                            req.setPhone(user.getPhone());
                            req.setNidNumber(newNid);
                            req.setProfileSelfiePhoto(user.getProfilePicture());
                            req.setPresentAddress(user.getAddress());
                            req.setSubmittedAt(LocalDateTime.now());
                            req.setStatus("PENDING");
                            req.setAdminRemarks("NID Number update requested by user. Awaiting admin review.");

                            verificationRequestRepository.save(req);
                        }
                    }

                    userRepository.save(user);

                    // Sync WorkerProfile if user is WORKER
                    if ("WORKER".equalsIgnoreCase(user.getRole())) {
                        workerProfileRepository.findByUserId(user.getId()).ifPresent(wp -> {
                            if (profile.getAddress() != null)
                                wp.setServiceArea(profile.getAddress());
                            if (profile.getLatitude() != null)
                                wp.setLatitude(profile.getLatitude());
                            if (profile.getLongitude() != null)
                                wp.setLongitude(profile.getLongitude());
                            workerProfileRepository.save(wp);
                        });

                        verificationRequestRepository.findTopByUserIdOrderBySubmittedAtDesc(user.getId())
                                .ifPresent(req -> {
                                    req.setFullName(user.getName());
                                    req.setPhone(user.getPhone());
                                    if (user.getAddress() != null)
                                        req.setPresentAddress(user.getAddress());
                                    if (user.getProfilePicture() != null)
                                        req.setProfileSelfiePhoto(user.getProfilePicture());
                                    verificationRequestRepository.save(req);
                                });
                    }

                    return ResponseEntity.ok(user);
                }).orElse(ResponseEntity.notFound().build());
    }
}

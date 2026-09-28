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
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody java.util.Map<String, Object> profileMap) {
        return userRepository.findById(id)
                .map(user -> {
                    // Update standard personal info immediately (No admin approval needed)
                    if (profileMap.containsKey("name") && profileMap.get("name") != null)
                        user.setName(profileMap.get("name").toString());
                    if (profileMap.containsKey("email") && profileMap.get("email") != null)
                        user.setEmail(profileMap.get("email").toString());
                    // Always update phone when provided (ensures admin sees latest phone)
                    if (profileMap.containsKey("phone") && profileMap.get("phone") != null)
                        user.setPhone(profileMap.get("phone").toString());
                    // ProfilePicture: allow clearing (empty string) and setting new value
                    if (profileMap.containsKey("profilePicture")) {
                        Object pic = profileMap.get("profilePicture");
                        if (pic == null || (pic instanceof String && ((String) pic).trim().isEmpty())) {
                            user.setProfilePicture(null);
                        } else {
                            user.setProfilePicture(pic.toString());
                        }
                    }
                    if (profileMap.containsKey("address") && profileMap.get("address") != null)
                        user.setAddress(profileMap.get("address").toString());
                    if (profileMap.containsKey("latitude") && profileMap.get("latitude") != null) {
                        try { user.setLatitude(Double.parseDouble(profileMap.get("latitude").toString())); } catch (Exception ignored) {}
                    }
                    if (profileMap.containsKey("longitude") && profileMap.get("longitude") != null) {
                        try { user.setLongitude(Double.parseDouble(profileMap.get("longitude").toString())); } catch (Exception ignored) {}
                    }

                    // NID Number Change Rule:
                    // If NID Number is changed, DO NOT update user.nidNumber directly.
                    // Instead create a PENDING Verification Request for Admin review & approval.
                    // Only when Admin approves will the NID be set on the user.
                    if (profileMap.containsKey("nidNumber") && profileMap.get("nidNumber") != null) {
                        String newNid = profileMap.get("nidNumber").toString().trim();
                        if (!newNid.isEmpty()) {
                            String currentNid = user.getNidNumber();

                            if (currentNid == null || !currentNid.equals(newNid)) {
                                // Create a new verification request (don't reuse old ones to keep audit trail)
                                VerificationRequest req = new VerificationRequest();
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
                            // NOTE: user.nidNumber is NOT updated here.
                            // It only gets updated when admin approves the verification request.
                        }
                    }

                    userRepository.save(user);

                    // Sync WorkerProfile if user is WORKER
                    if ("WORKER".equalsIgnoreCase(user.getRole())) {
                        workerProfileRepository.findByUserId(user.getId()).ifPresent(wp -> {
                            if (profileMap.containsKey("address") && profileMap.get("address") != null)
                                wp.setServiceArea(profileMap.get("address").toString());
                            if (user.getLatitude() != null)
                                wp.setLatitude(user.getLatitude());
                            if (user.getLongitude() != null)
                                wp.setLongitude(user.getLongitude());
                            workerProfileRepository.save(wp);
                        });
                    }

                    // Sync latest user details (name, phone, address, profilePicture) to their latest verification request
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

                    return ResponseEntity.ok(user);
                }).orElse(ResponseEntity.notFound().build());
    }
}

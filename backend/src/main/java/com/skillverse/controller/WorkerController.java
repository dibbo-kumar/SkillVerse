package com.skillverse.controller;

import com.skillverse.model.User;
import com.skillverse.model.WorkerProfile;
import com.skillverse.model.VerificationRequest;
import com.skillverse.repository.UserRepository;
import com.skillverse.repository.WorkerProfileRepository;
import com.skillverse.repository.VerificationRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;
    private final VerificationRequestRepository verificationRequestRepository;

    public WorkerController(WorkerProfileRepository workerProfileRepository, UserRepository userRepository,
                            VerificationRequestRepository verificationRequestRepository) {
        this.workerProfileRepository = workerProfileRepository;
        this.userRepository = userRepository;
        this.verificationRequestRepository = verificationRequestRepository;
    }

    @GetMapping
    public ResponseEntity<List<WorkerProfile>> getAllWorkers() {
        return ResponseEntity.ok(workerProfileRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerProfile> getWorkerProfile(@PathVariable Long id) {
        return workerProfileRepository.findByUserId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyWorker(@PathVariable Long id, @RequestParam String nid, @RequestParam(required = false) String frontPhoto) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setNidNumber(nid);
                    userRepository.save(user);

                    VerificationRequest existing = verificationRequestRepository.findByUserIdAndStatus(id, "PENDING").orElse(null);
                    if (existing != null) {
                        existing.setNidNumber(nid);
                        if (frontPhoto != null && !frontPhoto.isEmpty()) existing.setNidFrontPhoto(frontPhoto);
                        verificationRequestRepository.save(existing);
                        return ResponseEntity.ok(existing);
                    }

                    VerificationRequest req = new VerificationRequest(user, nid, 
                        (frontPhoto != null && !frontPhoto.isEmpty()) ? frontPhoto : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300", 
                        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300");
                    verificationRequestRepository.save(req);
                    return ResponseEntity.ok(req);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody WorkerProfile updatedProfile) {
        return workerProfileRepository.findByUserId(id)
                .map(profile -> {
                    if (updatedProfile.getSkills() != null) profile.setSkills(updatedProfile.getSkills());
                    if (updatedProfile.getExperienceYears() != null) profile.setExperienceYears(updatedProfile.getExperienceYears());
                    if (updatedProfile.getServiceArea() != null) profile.setServiceArea(updatedProfile.getServiceArea());
                    if (updatedProfile.getHourlyRate() != null) profile.setHourlyRate(updatedProfile.getHourlyRate());
                    profile.setAvailable(updatedProfile.isAvailable());
                    if (updatedProfile.getLatitude() != null) profile.setLatitude(updatedProfile.getLatitude());
                    if (updatedProfile.getLongitude() != null) profile.setLongitude(updatedProfile.getLongitude());

                    // Sync user location
                    User user = profile.getUser();
                    if (user != null) {
                        if (updatedProfile.getLatitude() != null) user.setLatitude(updatedProfile.getLatitude());
                        if (updatedProfile.getLongitude() != null) user.setLongitude(updatedProfile.getLongitude());
                        if (updatedProfile.getServiceArea() != null) user.setAddress(updatedProfile.getServiceArea());
                        userRepository.save(user);
                    }

                    workerProfileRepository.save(profile);
                    return ResponseEntity.ok(profile);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(@PathVariable Long id, @RequestParam Double lat, @RequestParam Double lon, @RequestParam(required = false) String area) {
        return workerProfileRepository.findByUserId(id)
                .map(profile -> {
                    profile.setLatitude(lat);
                    profile.setLongitude(lon);
                    if (area != null && !area.isEmpty()) {
                        profile.setServiceArea(area);
                    }
                    User user = profile.getUser();
                    if (user != null) {
                        user.setLatitude(lat);
                        user.setLongitude(lon);
                        if (area != null && !area.isEmpty()) user.setAddress(area);
                        userRepository.save(user);
                    }
                    workerProfileRepository.save(profile);
                    return ResponseEntity.ok(profile);
                }).orElse(ResponseEntity.notFound().build());
    }
}

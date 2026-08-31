package com.skillverse.controller;

import com.skillverse.model.User;
import com.skillverse.model.WorkerProfile;
import com.skillverse.repository.UserRepository;
import com.skillverse.repository.WorkerProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;

    public WorkerController(WorkerProfileRepository workerProfileRepository, UserRepository userRepository) {
        this.workerProfileRepository = workerProfileRepository;
        this.userRepository = userRepository;
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
    public ResponseEntity<?> verifyWorker(@PathVariable Long id, @RequestParam String nid) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setVerified(true);
                    user.setNidNumber(nid);
                    userRepository.save(user);
                    return ResponseEntity.ok("Worker verified successfully");
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

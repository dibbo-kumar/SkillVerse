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
                    profile.setSkills(updatedProfile.getSkills());
                    profile.setExperienceYears(updatedProfile.getExperienceYears());
                    profile.setServiceArea(updatedProfile.getServiceArea());
                    profile.setHourlyRate(updatedProfile.getHourlyRate());
                    profile.setAvailable(updatedProfile.isAvailable());
                    workerProfileRepository.save(profile);
                    return ResponseEntity.ok(profile);
                }).orElse(ResponseEntity.notFound().build());
    }
}

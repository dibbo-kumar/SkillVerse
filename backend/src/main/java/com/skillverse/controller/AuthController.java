package com.skillverse.controller;

import com.skillverse.model.User;
import com.skillverse.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final com.skillverse.repository.WorkerProfileRepository workerProfileRepository;

    public AuthController(UserRepository userRepository, com.skillverse.repository.WorkerProfileRepository workerProfileRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        User saved = userRepository.save(user);
        if ("WORKER".equals(saved.getRole())) {
            com.skillverse.model.WorkerProfile profile = new com.skillverse.model.WorkerProfile(
                saved, 
                "Electrical, Plumbing", 
                1, 
                "Dhaka North (Gulshan, Banani, Uttara)", 
                "Bronze", 
                350.0
            );
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
}

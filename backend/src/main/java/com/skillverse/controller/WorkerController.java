package com.skillverse.controller;

import com.skillverse.model.User;
import com.skillverse.model.WorkerProfile;
import com.skillverse.model.VerificationRequest;
import com.skillverse.repository.UserRepository;
import com.skillverse.repository.WorkerProfileRepository;
import com.skillverse.repository.VerificationRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

import com.skillverse.model.WorkerTeamMember;
import com.skillverse.repository.WorkerTeamMemberRepository;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final WorkerTeamMemberRepository teamMemberRepository;

    public WorkerController(WorkerProfileRepository workerProfileRepository, UserRepository userRepository,
                            VerificationRequestRepository verificationRequestRepository,
                            WorkerTeamMemberRepository teamMemberRepository) {
        this.workerProfileRepository = workerProfileRepository;
        this.userRepository = userRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    @GetMapping
    public ResponseEntity<List<WorkerProfile>> getAllWorkers() {
        return ResponseEntity.ok(workerProfileRepository.findAll());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Map<String, Object>>> getNearbyWorkers(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query
    ) {
        List<WorkerProfile> allProfiles = workerProfileRepository.findAll();
        List<Map<String, Object>> results = new java.util.ArrayList<>();

        String cleanCategory = (category != null && !category.trim().isEmpty() && !"All Categories".equalsIgnoreCase(category.trim()) && !"All".equalsIgnoreCase(category.trim()))
                ? category.trim().toLowerCase() : null;
        String cleanQuery = (query != null && !query.trim().isEmpty())
                ? query.trim().toLowerCase() : null;

        for (WorkerProfile profile : allProfiles) {
            User user = profile.getUser();
            if (user == null) continue;

            // Optional category filter
            if (cleanCategory != null) {
                String skills = profile.getSkills() != null ? profile.getSkills().toLowerCase() : "";
                if (!skills.contains(cleanCategory)) {
                    continue;
                }
            }

            // Optional query filter (matches name, skills, service area)
            if (cleanQuery != null) {
                String skills = profile.getSkills() != null ? profile.getSkills().toLowerCase() : "";
                String name = user.getName() != null ? user.getName().toLowerCase() : "";
                String area = profile.getServiceArea() != null ? profile.getServiceArea().toLowerCase() : "";
                if (!skills.contains(cleanQuery) && !name.contains(cleanQuery) && !area.contains(cleanQuery)) {
                    continue;
                }
            }

            Double workerLat = profile.getLatitude() != null ? profile.getLatitude() : user.getLatitude();
            Double workerLon = profile.getLongitude() != null ? profile.getLongitude() : user.getLongitude();

            Double distanceKm = null;
            String distanceString = null;

            if (lat != null && lon != null && workerLat != null && workerLon != null) {
                distanceKm = calculateDistanceKm(lat, lon, workerLat, workerLon);
                distanceString = formatDistanceString(distanceKm);

                // Radius filter if specified and > 0
                if (radius != null && radius > 0 && distanceKm > radius) {
                    continue;
                }
            } else if (radius != null && radius > 0 && (workerLat == null || workerLon == null)) {
                // If radius filter is active and technician has no coordinates, exclude them from radius filter
                continue;
            }

            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", profile.getId());
            map.put("skills", profile.getSkills());
            map.put("experienceYears", profile.getExperienceYears());
            map.put("serviceArea", profile.getServiceArea());
            map.put("careerLevel", profile.getCareerLevel());
            map.put("hourlyRate", profile.getHourlyRate());
            map.put("basePrice", profile.getBasePrice());
            map.put("available", profile.isAvailable());
            map.put("latitude", workerLat);
            map.put("longitude", workerLon);
            map.put("distanceKm", distanceKm != null ? Math.round(distanceKm * 100.0) / 100.0 : null);
            map.put("distanceString", distanceString);
            map.put("user", user);

            results.add(map);
        }

        // Sort by distance if customer location is provided
        if (lat != null && lon != null) {
            results.sort((a, b) -> {
                Double distA = (Double) a.get("distanceKm");
                Double distB = (Double) b.get("distanceKm");
                if (distA == null && distB == null) return 0;
                if (distA == null) return 1;
                if (distB == null) return -1;
                return Double.compare(distA, distB);
            });
        }

        return ResponseEntity.ok(results);
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private String formatDistanceString(double km) {
        if (km < 1.0) {
            int meters = (int) Math.round(km * 1000);
            return meters + "m away";
        } else {
            return String.format(java.util.Locale.US, "%.1f km away", km);
        }
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
                    if (updatedProfile.getBasePrice() != null) profile.setBasePrice(updatedProfile.getBasePrice());
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

    @GetMapping("/{leadWorkerId}/team-members")
    public ResponseEntity<List<WorkerTeamMember>> getTeamMembers(@PathVariable Long leadWorkerId) {
        return ResponseEntity.ok(teamMemberRepository.findByLeadWorkerIdAndStatusNot(leadWorkerId, "INACTIVE"));
    }

    @GetMapping("/team-members/pending")
    public ResponseEntity<List<WorkerTeamMember>> getPendingTeamMembers() {
        return ResponseEntity.ok(teamMemberRepository.findByStatus("PENDING_VERIFICATION"));
    }

    @GetMapping("/team-members/verified")
    public ResponseEntity<List<WorkerTeamMember>> getVerifiedTeamMembers() {
        return ResponseEntity.ok(teamMemberRepository.findByIsVerifiedTrueAndStatus("VERIFIED"));
    }

    @PostMapping("/{leadWorkerId}/team-members")
    public ResponseEntity<?> addTeamMember(@PathVariable Long leadWorkerId, @RequestBody TeamMemberRequest request) {
        Optional<User> leadOpt = userRepository.findById(leadWorkerId);
        if (leadOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lead Worker not found"));
        }
        WorkerTeamMember member = new WorkerTeamMember(
                leadOpt.get(),
                request.getName(),
                request.getPhone(),
                request.getSkill(),
                request.getExperienceYears()
        );
        WorkerTeamMember saved = teamMemberRepository.save(member);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/team-members/{memberId}/approve")
    public ResponseEntity<?> approveTeamMember(@PathVariable Long memberId) {
        Optional<WorkerTeamMember> memberOpt = teamMemberRepository.findById(memberId);
        if (memberOpt.isPresent()) {
            WorkerTeamMember m = memberOpt.get();
            m.setStatus("VERIFIED");
            m.setIsVerified(true);
            m.setVerifiedAt(java.time.LocalDateTime.now());
            WorkerTeamMember saved = teamMemberRepository.save(m);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/team-members/{memberId}/reject")
    public ResponseEntity<?> rejectTeamMember(@PathVariable Long memberId) {
        Optional<WorkerTeamMember> memberOpt = teamMemberRepository.findById(memberId);
        if (memberOpt.isPresent()) {
            WorkerTeamMember m = memberOpt.get();
            m.setStatus("REJECTED");
            m.setIsVerified(false);
            WorkerTeamMember saved = teamMemberRepository.save(m);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/team-members/{memberId}")
    public ResponseEntity<?> deleteTeamMember(@PathVariable Long memberId) {
        Optional<WorkerTeamMember> memberOpt = teamMemberRepository.findById(memberId);
        if (memberOpt.isPresent()) {
            WorkerTeamMember m = memberOpt.get();
            m.setStatus("INACTIVE");
            teamMemberRepository.save(m);
            return ResponseEntity.ok(Map.of("message", "Team member removed"));
        }
        return ResponseEntity.notFound().build();
    }

    public static class TeamMemberRequest {
        private String name;
        private String phone;
        private String skill;
        private Integer experienceYears;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getSkill() { return skill; }
        public void setSkill(String skill) { this.skill = skill; }

        public Integer getExperienceYears() { return experienceYears; }
        public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    }
}

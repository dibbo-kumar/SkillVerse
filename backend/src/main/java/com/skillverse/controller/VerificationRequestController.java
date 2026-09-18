package com.skillverse.controller;

import com.skillverse.model.AuditLog;
import com.skillverse.model.User;
import com.skillverse.model.VerificationRequest;
import com.skillverse.model.WorkerProfile;
import com.skillverse.repository.AuditLogRepository;
import com.skillverse.repository.UserRepository;
import com.skillverse.repository.VerificationRequestRepository;
import com.skillverse.repository.WorkerProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*")
public class VerificationRequestController {

    private final VerificationRequestRepository verificationRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final AuditLogRepository auditLogRepository;

    // In-memory OTP store for phone verification simulation
    private final Map<String, String> phoneOtpStore = new HashMap<>();

    public VerificationRequestController(VerificationRequestRepository verificationRepository,
                                         UserRepository userRepository,
                                         WorkerProfileRepository workerProfileRepository,
                                         AuditLogRepository auditLogRepository) {
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // --- 1. SEND & VERIFY PHONE OTP SIMULATOR ---

    @RequestMapping(value = "/send-phone-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> sendPhoneOtp(@RequestParam(required = false) String phone,
                                          @RequestBody(required = false) Map<String, String> payload) {
        String phoneNum = phone;
        if ((phoneNum == null || phoneNum.isEmpty()) && payload != null) {
            phoneNum = payload.get("phone");
        }
        if (phoneNum == null || phoneNum.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }
        phoneNum = phoneNum.trim();
        // Generate 4-digit OTP
        String otp = String.format("%04d", new Random().nextInt(10000));
        phoneOtpStore.put(phoneNum, otp);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "phone", phoneNum,
                "simulatedOtp", otp,
                "otp", otp,
                "message", "Verification code sent to " + phoneNum + " (Demo OTP: " + otp + ")"
        ));
    }

    @RequestMapping(value = "/verify-phone-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> verifyPhoneOtp(@RequestParam(required = false) String phone,
                                            @RequestParam(required = false) String otp,
                                            @RequestBody(required = false) Map<String, String> payload) {
        String phoneNum = phone;
        String enteredOtp = otp;
        if ((phoneNum == null || phoneNum.isEmpty()) && payload != null) {
            phoneNum = payload.get("phone");
        }
        if ((enteredOtp == null || enteredOtp.isEmpty()) && payload != null) {
            enteredOtp = payload.get("otp");
        }

        if (phoneNum == null || enteredOtp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number and OTP code are required"));
        }
        phoneNum = phoneNum.trim();
        enteredOtp = enteredOtp.trim();

        String expectedOtp = phoneOtpStore.get(phoneNum);
        // Allow fallback code "1234" for automated or demo testing
        boolean isValid = (expectedOtp != null && expectedOtp.equals(enteredOtp)) || "1234".equals(enteredOtp);

        if (isValid) {
            phoneOtpStore.remove(phoneNum);
            return ResponseEntity.ok(Map.of(
                    "verified", true,
                    "status", "VERIFIED",
                    "phone", phoneNum,
                    "message", "Phone number verified successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "verified", false,
                    "status", "FAILED",
                    "error", "Invalid OTP code. Please check SMS and try again."
            ));
        }
    }

    // --- 2. SUBMIT / RESUBMIT COMPLETE VERIFICATION DOSSIER ---

    @PostMapping("/submit")
    public ResponseEntity<?> submitVerification(@RequestBody VerificationSubmissionDto dto) {
        if (dto.getUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
        }

        User user = userRepository.findById(dto.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        // Update User info
        if (dto.getFullName() != null && !dto.getFullName().isEmpty()) user.setName(dto.getFullName());
        if (dto.getPhone() != null && !dto.getPhone().isEmpty()) user.setPhone(dto.getPhone());
        if (dto.getNidNumber() != null && !dto.getNidNumber().isEmpty()) user.setNidNumber(dto.getNidNumber());
        if (dto.getProfileSelfiePhoto() != null && !dto.getProfileSelfiePhoto().isEmpty()) user.setProfilePicture(dto.getProfileSelfiePhoto());
        
        String formattedAddress = (dto.getDetailedAddress() != null && !dto.getDetailedAddress().isEmpty()) 
                ? dto.getDetailedAddress() 
                : (dto.getPresentAddress() != null ? dto.getPresentAddress() : user.getAddress());
        user.setAddress(formattedAddress);
        user.setVerified(false);
        user.setStatus("UNDER_REVIEW");
        userRepository.save(user);

        // Update / create WorkerProfile
        WorkerProfile profile = workerProfileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) {
            profile = new WorkerProfile(user, dto.getSkills() != null ? dto.getSkills() : "Technical Maintenance",
                    dto.getExperienceYears() != null ? dto.getExperienceYears() : 1,
                    dto.getCityArea() != null ? dto.getCityArea() : "Dhaka",
                    "Bronze", 350.0);
        } else {
            if (dto.getSkills() != null && !dto.getSkills().isEmpty()) profile.setSkills(dto.getSkills());
            if (dto.getExperienceYears() != null) profile.setExperienceYears(dto.getExperienceYears());
            if (dto.getCityArea() != null && !dto.getCityArea().isEmpty()) profile.setServiceArea(dto.getCityArea() + ", " + (dto.getDivision() != null ? dto.getDivision() : "Dhaka"));
        }
        workerProfileRepository.save(profile);

        // Check if existing verification request exists
        VerificationRequest req = verificationRepository.findTopByUserIdOrderBySubmittedAtDesc(user.getId()).orElse(null);
        if (req == null) {
            req = new VerificationRequest();
            req.setUser(user);
        }

        // Populate fields
        req.setFullName(dto.getFullName() != null ? dto.getFullName() : user.getName());
        req.setDateOfBirth(dto.getDateOfBirth());
        req.setPhone(dto.getPhone() != null ? dto.getPhone() : user.getPhone());
        req.setPhoneVerified(dto.getPhoneVerified() != null ? dto.getPhoneVerified() : true);
        req.setNidNumber(dto.getNidNumber());
        req.setNidFrontPhoto(dto.getNidFrontPhoto());
        req.setNidBackPhoto(dto.getNidBackPhoto());
        req.setProfileSelfiePhoto(dto.getProfileSelfiePhoto() != null ? dto.getProfileSelfiePhoto() : user.getProfilePicture());

        req.setPresentAddress(dto.getPresentAddress());
        req.setPermanentAddress(dto.getPermanentAddress());
        req.setDivision(dto.getDivision());
        req.setDistrict(dto.getDistrict());
        req.setCityArea(dto.getCityArea());
        req.setPostalCode(dto.getPostalCode());
        req.setDetailedAddress(dto.getDetailedAddress());

        req.setSkills(dto.getSkills());
        req.setExperienceYears(dto.getExperienceYears());
        req.setExperienceDescription(dto.getExperienceDescription());
        req.setPreviousEmployer(dto.getPreviousEmployer());
        req.setExperienceCertPhoto(dto.getExperienceCertPhoto());
        req.setTrainingCertPhoto(dto.getTrainingCertPhoto());
        req.setWorkProofPhoto(dto.getWorkProofPhoto());

        req.setPayoutMethod(dto.getPayoutMethod() != null ? dto.getPayoutMethod() : "bKash");
        req.setPayoutAccount(dto.getPayoutAccount());
        req.setPayoutAccountHolder(dto.getPayoutAccountHolder());
        req.setPayoutBankName(dto.getPayoutBankName());
        req.setPayoutBankBranch(dto.getPayoutBankBranch());

        req.setStatus("PENDING");
        req.setAdminRemarks(null);
        req.setSubmittedAt(LocalDateTime.now());

        VerificationRequest saved = verificationRepository.save(req);

        auditLogRepository.save(new AuditLog(
                "VERIFICATION_SUBMITTED",
                user.getName(),
                "WORKER",
                "VerificationRequest",
                saved.getId(),
                "Worker " + user.getName() + " submitted complete verification dossier for administrative review."
        ));

        return ResponseEntity.ok(saved);
    }

    // --- 3. GET VERIFICATION STATUS FOR WORKER ---

    @GetMapping("/worker/{userId}")
    public ResponseEntity<?> getWorkerVerification(@PathVariable Long userId) {
        return verificationRepository.findTopByUserIdOrderBySubmittedAtDesc(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VerificationRequest>> getUserRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(verificationRepository.findByUserIdOrderBySubmittedAtDesc(userId));
    }

    // --- 4. ADMIN QUEUES ---

    @GetMapping("/pending")
    public ResponseEntity<List<VerificationRequest>> getPendingRequests() {
        return ResponseEntity.ok(verificationRepository.findByStatusOrderBySubmittedAtDesc("PENDING"));
    }

    // Approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveVerification(@PathVariable Long id) {
        return verificationRepository.findById(id).map(req -> {
            req.setStatus("APPROVED");
            req.setReviewedAt(LocalDateTime.now());
            verificationRepository.save(req);

            User user = req.getUser();
            if (user != null) {
                user.setVerified(true);
                user.setStatus("ACTIVE");
                if (req.getNidNumber() != null) user.setNidNumber(req.getNidNumber());
                userRepository.save(user);
            }

            auditLogRepository.save(new AuditLog(
                    "VERIFICATION_APPROVED",
                    "System Admin",
                    "ADMIN",
                    "VerificationRequest",
                    req.getId(),
                    "Verification #" + req.getId() + " approved & certified for " + (user != null ? user.getName() : "Worker")
            ));

            return ResponseEntity.ok(req);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Request Correction
    @PutMapping("/{id}/correction")
    public ResponseEntity<?> requestCorrection(@PathVariable Long id, @RequestParam String reason) {
        return verificationRepository.findById(id).map(req -> {
            req.setStatus("CORRECTION_REQUIRED");
            req.setAdminRemarks(reason);
            req.setReviewedAt(LocalDateTime.now());
            verificationRepository.save(req);

            User user = req.getUser();
            if (user != null) {
                user.setVerified(false);
                user.setStatus("CORRECTION_REQUIRED");
                userRepository.save(user);
            }

            auditLogRepository.save(new AuditLog(
                    "VERIFICATION_CORRECTION_REQUESTED",
                    "System Admin",
                    "ADMIN",
                    "VerificationRequest",
                    req.getId(),
                    "Correction requested for Verification #" + req.getId() + ". Reason: " + reason
            ));

            return ResponseEntity.ok(req);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectVerification(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return verificationRepository.findById(id).map(req -> {
            req.setStatus("REJECTED");
            req.setAdminRemarks(reason);
            req.setReviewedAt(LocalDateTime.now());
            verificationRepository.save(req);

            User user = req.getUser();
            if (user != null) {
                user.setVerified(false);
                user.setStatus("REJECTED");
                userRepository.save(user);
            }

            auditLogRepository.save(new AuditLog(
                    "VERIFICATION_REJECTED",
                    "System Admin",
                    "ADMIN",
                    "VerificationRequest",
                    req.getId(),
                    "Verification #" + req.getId() + " rejected. Reason: " + reason
            ));

            return ResponseEntity.ok(req);
        }).orElse(ResponseEntity.notFound().build());
    }

    // DTO Class
    public static class VerificationSubmissionDto {
        private Long userId;
        private String fullName;
        private String dateOfBirth;
        private String phone;
        private Boolean phoneVerified;
        private String nidNumber;
        private String nidFrontPhoto;
        private String nidBackPhoto;
        private String profileSelfiePhoto;

        private String presentAddress;
        private String permanentAddress;
        private String division;
        private String district;
        private String cityArea;
        private String postalCode;
        private String detailedAddress;

        private String skills;
        private Integer experienceYears;
        private String experienceDescription;
        private String previousEmployer;
        private String experienceCertPhoto;
        private String trainingCertPhoto;
        private String workProofPhoto;

        private String payoutMethod;
        private String payoutAccount;
        private String payoutAccountHolder;
        private String payoutBankName;
        private String payoutBankBranch;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public Boolean getPhoneVerified() { return phoneVerified; }
        public void setPhoneVerified(Boolean phoneVerified) { this.phoneVerified = phoneVerified; }

        public String getNidNumber() { return nidNumber; }
        public void setNidNumber(String nidNumber) { this.nidNumber = nidNumber; }

        public String getNidFrontPhoto() { return nidFrontPhoto; }
        public void setNidFrontPhoto(String nidFrontPhoto) { this.nidFrontPhoto = nidFrontPhoto; }

        public String getNidBackPhoto() { return nidBackPhoto; }
        public void setNidBackPhoto(String nidBackPhoto) { this.nidBackPhoto = nidBackPhoto; }

        public String getProfileSelfiePhoto() { return profileSelfiePhoto; }
        public void setProfileSelfiePhoto(String profileSelfiePhoto) { this.profileSelfiePhoto = profileSelfiePhoto; }

        public String getPresentAddress() { return presentAddress; }
        public void setPresentAddress(String presentAddress) { this.presentAddress = presentAddress; }

        public String getPermanentAddress() { return permanentAddress; }
        public void setPermanentAddress(String permanentAddress) { this.permanentAddress = permanentAddress; }

        public String getDivision() { return division; }
        public void setDivision(String division) { this.division = division; }

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public String getCityArea() { return cityArea; }
        public void setCityArea(String cityArea) { this.cityArea = cityArea; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

        public String getDetailedAddress() { return detailedAddress; }
        public void setDetailedAddress(String detailedAddress) { this.detailedAddress = detailedAddress; }

        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }

        public Integer getExperienceYears() { return experienceYears; }
        public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

        public String getExperienceDescription() { return experienceDescription; }
        public void setExperienceDescription(String experienceDescription) { this.experienceDescription = experienceDescription; }

        public String getPreviousEmployer() { return previousEmployer; }
        public void setPreviousEmployer(String previousEmployer) { this.previousEmployer = previousEmployer; }

        public String getExperienceCertPhoto() { return experienceCertPhoto; }
        public void setExperienceCertPhoto(String experienceCertPhoto) { this.experienceCertPhoto = experienceCertPhoto; }

        public String getTrainingCertPhoto() { return trainingCertPhoto; }
        public void setTrainingCertPhoto(String trainingCertPhoto) { this.trainingCertPhoto = trainingCertPhoto; }

        public String getWorkProofPhoto() { return workProofPhoto; }
        public void setWorkProofPhoto(String workProofPhoto) { this.workProofPhoto = workProofPhoto; }

        public String getPayoutMethod() { return payoutMethod; }
        public void setPayoutMethod(String payoutMethod) { this.payoutMethod = payoutMethod; }

        public String getPayoutAccount() { return payoutAccount; }
        public void setPayoutAccount(String payoutAccount) { this.payoutAccount = payoutAccount; }

        public String getPayoutAccountHolder() { return payoutAccountHolder; }
        public void setPayoutAccountHolder(String payoutAccountHolder) { this.payoutAccountHolder = payoutAccountHolder; }

        public String getPayoutBankName() { return payoutBankName; }
        public void setPayoutBankName(String payoutBankName) { this.payoutBankName = payoutBankName; }

        public String getPayoutBankBranch() { return payoutBankBranch; }
        public void setPayoutBankBranch(String payoutBankBranch) { this.payoutBankBranch = payoutBankBranch; }
    }
}

package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_requests")
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // 1. Personal & Identity Information
    private String fullName;
    private String dateOfBirth;
    private String phone;
    private Boolean phoneVerified = false;
    private String nidNumber;

    @Column(columnDefinition = "TEXT")
    private String nidFrontPhoto;

    @Column(columnDefinition = "TEXT")
    private String nidBackPhoto;

    @Column(columnDefinition = "TEXT")
    private String profileSelfiePhoto;

    // 2. Address Information
    private String presentAddress;
    private String permanentAddress;
    private String division;
    private String district;
    private String cityArea;
    private String postalCode;
    
    @Column(columnDefinition = "TEXT")
    private String detailedAddress;

    // 3. Professional Information
    private String skills;
    private Integer experienceYears;

    @Column(columnDefinition = "TEXT")
    private String experienceDescription;

    private String previousEmployer;

    @Column(columnDefinition = "TEXT")
    private String experienceCertPhoto;

    @Column(columnDefinition = "TEXT")
    private String trainingCertPhoto;

    @Column(columnDefinition = "TEXT")
    private String workProofPhoto;

    // 4. Payout Information
    private String payoutMethod; // bKash, Nagad, Rocket, Bank Account
    private String payoutAccount;
    private String payoutAccountHolder;
    private String payoutBankName;
    private String payoutBankBranch;

    // Workflow & Status
    private String status = "PENDING"; // PENDING, APPROVED, CORRECTION_REQUIRED, REJECTED, SUSPENDED

    @Column(columnDefinition = "TEXT")
    private String adminRemarks;

    private LocalDateTime submittedAt = LocalDateTime.now();
    private LocalDateTime reviewedAt;

    public VerificationRequest() {}

    public VerificationRequest(User user, String nidNumber, String nidFrontPhoto, String nidBackPhoto) {
        this.user = user;
        this.nidNumber = nidNumber;
        this.nidFrontPhoto = nidFrontPhoto;
        this.nidBackPhoto = nidBackPhoto;
        this.status = "PENDING";
        this.submittedAt = LocalDateTime.now();
        if (user != null) {
            this.fullName = user.getName();
            this.phone = user.getPhone();
            this.phoneVerified = true;
            this.profileSelfiePhoto = user.getProfilePicture();
            this.presentAddress = user.getAddress();
            this.permanentAddress = user.getAddress();
            this.division = "Dhaka";
            this.district = "Dhaka";
            this.cityArea = "Uttara / Central Dhaka";
            this.postalCode = "1230";
            this.detailedAddress = user.getAddress();
            this.skills = "AC Repair, Electrical, Plumbing";
            this.experienceYears = 5;
            this.payoutMethod = "bKash";
            this.payoutAccount = user.getPhone();
            this.payoutAccountHolder = user.getName();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName != null ? fullName : (user != null ? user.getName() : ""); }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPhone() { return phone != null ? phone : (user != null ? user.getPhone() : ""); }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getPhoneVerified() { return phoneVerified != null ? phoneVerified : false; }
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

    public String getStatus() { return status != null ? status : "PENDING"; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminRemarks() { return adminRemarks; }
    public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }

    public LocalDateTime getSubmittedAt() { return submittedAt != null ? submittedAt : LocalDateTime.now(); }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}

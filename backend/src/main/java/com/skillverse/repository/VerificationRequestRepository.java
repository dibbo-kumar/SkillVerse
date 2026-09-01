package com.skillverse.repository;

import com.skillverse.model.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {
    List<VerificationRequest> findByStatus(String status);
    Optional<VerificationRequest> findByUserIdAndStatus(Long userId, String status);
    List<VerificationRequest> findByUserId(Long userId);
}

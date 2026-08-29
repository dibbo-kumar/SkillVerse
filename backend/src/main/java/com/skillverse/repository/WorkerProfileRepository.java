package com.skillverse.repository;

import com.skillverse.model.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    Optional<WorkerProfile> findByUserId(Long userId);
    List<WorkerProfile> findBySkillsContainingIgnoreCase(String skill);
}

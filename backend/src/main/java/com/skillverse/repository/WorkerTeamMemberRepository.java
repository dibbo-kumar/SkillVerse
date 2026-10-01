package com.skillverse.repository;

import com.skillverse.model.WorkerTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkerTeamMemberRepository extends JpaRepository<WorkerTeamMember, Long> {
    List<WorkerTeamMember> findByLeadWorkerId(Long leadWorkerId);
    List<WorkerTeamMember> findByLeadWorkerIdAndStatusNot(Long leadWorkerId, String status);
    List<WorkerTeamMember> findByStatus(String status);
    List<WorkerTeamMember> findByIsVerifiedTrueAndStatus(String status);
}

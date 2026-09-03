package com.skillverse.repository;

import com.skillverse.model.ProblemPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProblemPostRepository extends JpaRepository<ProblemPost, Long> {
    List<ProblemPost> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<ProblemPost> findByStatusOrderByCreatedAtDesc(String status);
}

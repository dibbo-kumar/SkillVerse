package com.skillverse.repository;

import com.skillverse.model.ProblemOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProblemOfferRepository extends JpaRepository<ProblemOffer, Long> {
    List<ProblemOffer> findByProblemPostId(Long problemPostId);
    List<ProblemOffer> findByWorkerId(Long workerId);
    Optional<ProblemOffer> findByProblemPostIdAndWorkerId(Long problemPostId, Long workerId);
}

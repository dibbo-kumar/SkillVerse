package com.skillverse.repository;

import com.skillverse.model.WorkerWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WorkerWalletRepository extends JpaRepository<WorkerWallet, Long> {
    Optional<WorkerWallet> findByWorkerId(Long workerId);
}

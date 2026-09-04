package com.skillverse.repository;

import com.skillverse.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
    List<WalletTransaction> findAllByOrderByCreatedAtDesc();
    List<WalletTransaction> findByTransactionTypeOrderByCreatedAtDesc(String transactionType);
}

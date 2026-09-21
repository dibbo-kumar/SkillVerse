package com.skillverse.controller;

import com.skillverse.model.*;
import com.skillverse.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WorkerWalletController {

    private final WorkerWalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public WorkerWalletController(WorkerWalletRepository walletRepository,
                                  WalletTransactionRepository transactionRepository,
                                  UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> getWallet(@PathVariable Long workerId) {
        User worker = userRepository.findById(workerId).orElse(null);
        if (worker == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker not found"));
        }

        WorkerWallet wallet = walletRepository.findByWorkerId(workerId)
                .orElseGet(() -> walletRepository.save(new WorkerWallet(worker)));

        // Guarantee balance is never negative
        if (wallet.getBalance() == null || wallet.getBalance() < 0.0) {
            wallet.setBalance(0.0);
            walletRepository.save(wallet);
        }

        return ResponseEntity.ok(wallet);
    }

    @GetMapping("/transactions/worker/{workerId}")
    public ResponseEntity<List<WalletTransaction>> getTransactions(@PathVariable Long workerId) {
        return ResponseEntity.ok(transactionRepository.findByWorkerIdOrderByCreatedAtDesc(workerId));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(@RequestBody Map<String, Object> req) {
        Long workerId = Long.valueOf(req.get("workerId").toString());
        Double amount = Double.valueOf(req.get("amount").toString());
        String method = req.getOrDefault("method", "bKash").toString();
        String accountNo = req.getOrDefault("accountNo", "").toString();
        String bankName = req.getOrDefault("bankName", "").toString();
        String branchName = req.getOrDefault("branchName", "").toString();
        String accountHolder = req.getOrDefault("accountHolder", "").toString();

        User worker = userRepository.findById(workerId).orElse(null);
        if (worker == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker not found"));
        }

        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cashout amount must be greater than 0."));
        }

        WorkerWallet wallet = walletRepository.findByWorkerId(workerId)
                .orElseGet(() -> walletRepository.save(new WorkerWallet(worker)));

        double currentBal = wallet.getBalance() != null ? Math.max(0.0, wallet.getBalance()) : 0.0;
        if (currentBal < amount) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient available balance for cashout. Available balance: ৳" + currentBal));
        }

        // Deduct from main wallet, ensuring balance can never be negative
        double newBalance = Math.max(0.0, Math.round((currentBal - amount) * 100.0) / 100.0);
        wallet.setBalance(newBalance);
        double totalWithdrawn = (wallet.getTotalWithdrawals() != null ? wallet.getTotalWithdrawals() : 0.0) + amount;
        wallet.setTotalWithdrawals(Math.round(totalWithdrawn * 100.0) / 100.0);
        wallet.setUpdatedAt(java.time.LocalDateTime.now());
        walletRepository.save(wallet);

        String desc;
        if ("Bank".equalsIgnoreCase(method) || "Bank Transfer".equalsIgnoreCase(method)) {
            desc = "Bank Cashout to " + (bankName.isEmpty() ? "Bank" : bankName) + " (A/C: " + accountNo + ", Branch: " + (branchName.isEmpty() ? "Principal" : branchName) + ", Holder: " + accountHolder + ")";
        } else {
            desc = "Cashout via " + method + " (" + accountNo + ")";
        }

        WalletTransaction tx = new WalletTransaction(
                worker, "WITHDRAWAL", -amount, desc, null
        );
        tx.setStatus("COMPLETED");
        transactionRepository.save(tx);

        return ResponseEntity.ok(Map.of(
                "message", "Cashout of ৳" + amount + " via " + method + " processed successfully.",
                "wallet", wallet,
                "transaction", tx
        ));
    }
}

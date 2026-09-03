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

        User worker = userRepository.findById(workerId).orElse(null);
        if (worker == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker not found"));
        }

        WorkerWallet wallet = walletRepository.findByWorkerId(workerId)
                .orElseGet(() -> walletRepository.save(new WorkerWallet(worker)));

        if (wallet.getBalance() < amount) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient available balance for withdrawal. Current balance: ৳" + wallet.getBalance()));
        }

        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setTotalWithdrawals(wallet.getTotalWithdrawals() + amount);
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                worker, "WITHDRAWAL", -amount,
                "Withdrawal to " + method + " (" + accountNo + ")", null
        );
        transactionRepository.save(tx);

        return ResponseEntity.ok(Map.of(
                "message", "Withdrawal of ৳" + amount + " requested successfully.",
                "wallet", wallet,
                "transaction", tx
        ));
    }
}

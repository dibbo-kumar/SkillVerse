package com.skillverse.controller;

import com.skillverse.model.*;
import com.skillverse.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ServiceBookingRepository bookingRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final WorkerWalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final ToolStoreProductRepository productRepository;
    private final StoreOrderRepository orderRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingRepository settingRepository;

    public AdminController(UserRepository userRepository,
                           WorkerProfileRepository workerProfileRepository,
                           ServiceBookingRepository bookingRepository,
                           VerificationRequestRepository verificationRequestRepository,
                           WorkerWalletRepository walletRepository,
                           WalletTransactionRepository transactionRepository,
                           ToolStoreProductRepository productRepository,
                           StoreOrderRepository orderRepository,
                           CourseRepository courseRepository,
                           CourseEnrollmentRepository enrollmentRepository,
                           AuditLogRepository auditLogRepository,
                           PlatformSettingRepository settingRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.settingRepository = settingRepository;

        initDefaultSettingsAndLogs();
    }

    private void initDefaultSettingsAndLogs() {
        if (settingRepository.count() == 0) {
            settingRepository.save(new PlatformSetting("platform_commission", "5", "Platform commission deduction percentage from worker earnings"));
            settingRepository.save(new PlatformSetting("platform_name", "SkillVerse Bangladesh", "Official platform title and branding"));
            settingRepository.save(new PlatformSetting("currency", "BDT", "Platform standard transaction currency"));
            settingRepository.save(new PlatformSetting("emergency_hotline", "+880 1700 000000", "24/7 Rapid response dispatch hotline"));
            settingRepository.save(new PlatformSetting("max_active_jobs", "1", "Maximum concurrent active jobs permitted per technician"));
            settingRepository.save(new PlatformSetting("service_guarantee_days", "30", "Warranty period for verified completed bookings in days"));
        }

        if (auditLogRepository.count() == 0) {
            auditLogRepository.save(new AuditLog("SYSTEM_BOOT", "System Engine", "SYSTEM", "Platform", 1L, "SkillVerse core administrative management systems initialized cleanly."));
            auditLogRepository.save(new AuditLog("WORKER_REGISTERED", "Kamrul Islam", "WORKER", "User", 3L, "Technician registered with HVAC & Electrical skills."));
            auditLogRepository.save(new AuditLog("VERIFICATION_APPROVED", "System Admin", "ADMIN", "Worker", 3L, "NID verification verified & certified for Kamrul Islam."));
        }
    }

    // ==========================================
    // 1. OVERVIEW DASHBOARD METRICS & FEED
    // ==========================================

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        List<User> allUsers = userRepository.findAll();
        long totalCustomers = allUsers.stream().filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole())).count();
        long totalWorkers = allUsers.stream().filter(u -> "WORKER".equalsIgnoreCase(u.getRole())).count();

        List<VerificationRequest> pendingVerifs = verificationRequestRepository.findByStatus("PENDING");
        List<ServiceBooking> allBookings = bookingRepository.findAllByOrderByCreatedAtDesc();

        List<String> activeStatuses = List.of("CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETION_REQUESTED");
        long activeBookings = allBookings.stream().filter(b -> activeStatuses.contains(b.getStatus())).count();
        long completedBookings = allBookings.stream().filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus())).count();

        double totalRevenue = allBookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getAgreedCost() != null ? b.getAgreedCost() : (b.getEstimatedCost() != null ? b.getEstimatedCost() : 0.0))
                .sum();

        double platformRevenue = allBookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getPlatformCommission() != null && b.getPlatformCommission() > 0 ? b.getPlatformCommission() : (b.getAgreedCost() != null ? b.getAgreedCost() * 0.05 : 0.0))
                .sum();

        double workerEarnings = totalRevenue - platformRevenue;

        List<WalletTransaction> allTx = transactionRepository.findAllByOrderByCreatedAtDesc();
        long pendingWithdrawals = allTx.stream()
                .filter(t -> "WITHDRAWAL".equalsIgnoreCase(t.getTransactionType()) && "PENDING".equalsIgnoreCase(t.getStatus()))
                .count();

        List<ToolStoreProduct> lowStockTools = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 10)
                .collect(Collectors.toList());

        // Booking status distribution
        Map<String, Long> statusDistribution = allBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getStatus() != null ? b.getStatus() : "PENDING", Collectors.counting()));

        // Popular services
        Map<String, Long> servicePopularity = allBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getServiceType() != null ? b.getServiceType() : "General Maintenance", Collectors.counting()));

        Map<String, Object> response = new HashMap<>();
        response.put("totalCustomers", totalCustomers);
        response.put("totalWorkers", totalWorkers);
        response.put("totalUsers", allUsers.size());
        response.put("pendingVerifications", pendingVerifs.size());
        response.put("activeBookings", activeBookings);
        response.put("completedBookings", completedBookings);
        response.put("totalBookings", allBookings.size());
        response.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        response.put("platformRevenue", Math.round(platformRevenue * 100.0) / 100.0);
        response.put("workerEarnings", Math.round(workerEarnings * 100.0) / 100.0);
        response.put("pendingWithdrawals", pendingWithdrawals);
        response.put("lowStockToolsCount", lowStockTools.size());

        response.put("recentBookings", allBookings.stream().limit(8).collect(Collectors.toList()));
        response.put("recentVerifications", pendingVerifs.stream().limit(6).collect(Collectors.toList()));
        response.put("recentTransactions", allTx.stream().limit(8).collect(Collectors.toList()));
        response.put("recentLogs", auditLogRepository.findTop50ByOrderByTimestampDesc().stream().limit(10).collect(Collectors.toList()));
        response.put("statusDistribution", statusDistribution);
        response.put("servicePopularity", servicePopularity);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 2. USER MANAGEMENT
    // ==========================================

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        List<User> users = userRepository.findAll();
        List<ServiceBooking> bookings = bookingRepository.findAll();
        List<WorkerProfile> profiles = workerProfileRepository.findAll();

        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("role", u.getRole());
            map.put("nidNumber", u.getNidNumber());
            map.put("isVerified", u.isVerified());
            map.put("status", u.getStatus() != null ? u.getStatus() : "ACTIVE");
            map.put("rating", u.getRating() != null ? u.getRating() : 5.0);
            map.put("address", u.getAddress());
            map.put("profilePicture", u.getProfilePicture());
            map.put("createdAt", u.getCreatedAt());

            if ("WORKER".equalsIgnoreCase(u.getRole())) {
                long totalJobs = bookings.stream().filter(b -> b.getWorker() != null && b.getWorker().getId().equals(u.getId())).count();
                long completedJobs = bookings.stream().filter(b -> b.getWorker() != null && b.getWorker().getId().equals(u.getId()) && ("COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus()))).count();
                WorkerProfile p = profiles.stream().filter(pr -> pr.getUser() != null && pr.getUser().getId().equals(u.getId())).findFirst().orElse(null);
                map.put("totalJobs", totalJobs);
                map.put("completedJobs", completedJobs);
                map.put("skills", p != null ? p.getSkills() : "Technical Service");
                map.put("careerLevel", p != null ? p.getCareerLevel() : "Gold");
                map.put("hourlyRate", p != null ? p.getHourlyRate() : 400.0);
            } else {
                long totalBookings = bookings.stream().filter(b -> b.getCustomer() != null && b.getCustomer().getId().equals(u.getId())).count();
                double totalSpent = bookings.stream()
                        .filter(b -> b.getCustomer() != null && b.getCustomer().getId().equals(u.getId()) && "PAID".equalsIgnoreCase(b.getPaymentStatus()))
                        .mapToDouble(b -> b.getAgreedCost() != null ? b.getAgreedCost() : (b.getEstimatedCost() != null ? b.getEstimatedCost() : 0.0))
                        .sum();
                map.put("totalBookings", totalBookings);
                map.put("totalSpent", totalSpent);
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        return userRepository.findById(id).map(user -> {
            user.setStatus(status.toUpperCase());
            userRepository.save(user);

            auditLogRepository.save(new AuditLog(
                    "USER_STATUS_CHANGE",
                    "System Admin",
                    "ADMIN",
                    "User",
                    user.getId(),
                    "User " + user.getName() + " (" + user.getRole() + ") status updated to " + status.toUpperCase()
            ));

            return ResponseEntity.ok(Map.of("message", "User status updated to " + status.toUpperCase(), "user", user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 3. WORKER VERIFICATION DIRECTORY
    // ==========================================

    @GetMapping("/verification/requests")
    public ResponseEntity<List<VerificationRequest>> getVerificationRequests(@RequestParam(required = false) String status) {
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(verificationRequestRepository.findByStatus(status.toUpperCase()));
        }
        return ResponseEntity.ok(verificationRequestRepository.findAllByOrderBySubmittedAtDesc());
    }

    @PutMapping("/verification/{id}/decision")
    public ResponseEntity<?> decideVerification(@PathVariable Long id,
                                                @RequestParam String decision, // APPROVE, REJECT, SUSPEND
                                                @RequestParam(required = false) String reason) {
        return verificationRequestRepository.findById(id).map(req -> {
            String dec = decision.toUpperCase();
            req.setStatus(dec);
            verificationRequestRepository.save(req);

            User user = req.getUser();
            if (user != null) {
                if ("APPROVE".equals(dec) || "APPROVED".equals(dec)) {
                    user.setVerified(true);
                    user.setNidNumber(req.getNidNumber());
                    user.setStatus("ACTIVE");
                } else if ("SUSPEND".equals(dec) || "SUSPENDED".equals(dec)) {
                    user.setVerified(false);
                    user.setStatus("SUSPENDED");
                } else {
                    user.setVerified(false);
                }
                userRepository.save(user);
            }

            auditLogRepository.save(new AuditLog(
                    "WORKER_VERIFICATION_" + dec,
                    "System Admin",
                    "ADMIN",
                    "Worker",
                    req.getUser() != null ? req.getUser().getId() : req.getId(),
                    "Verification request #" + id + " marked " + dec + (reason != null ? " Reason: " + reason : "")
            ));

            return ResponseEntity.ok(Map.of("message", "Verification decision recorded: " + dec, "request", req));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 4. BOOKINGS DIRECTORY
    // ==========================================

    @GetMapping("/bookings")
    public ResponseEntity<List<ServiceBooking>> getAllBookings(@RequestParam(required = false) String status) {
        List<ServiceBooking> list = bookingRepository.findAllByOrderByCreatedAtDesc();
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            list = list.stream().filter(b -> status.equalsIgnoreCase(b.getStatus())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(list);
    }

    // ==========================================
    // 5. FINANCE & WITHDRAWALS
    // ==========================================

    @GetMapping("/finance")
    public ResponseEntity<Map<String, Object>> getFinanceOverview() {
        List<ServiceBooking> allBookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        List<WorkerWallet> allWallets = walletRepository.findAll();
        List<WalletTransaction> allTx = transactionRepository.findAllByOrderByCreatedAtDesc();

        double totalServiceVolume = allBookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getAgreedCost() != null ? b.getAgreedCost() : (b.getEstimatedCost() != null ? b.getEstimatedCost() : 0.0))
                .sum();

        double platformCommission = allBookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getPlatformCommission() != null && b.getPlatformCommission() > 0 ? b.getPlatformCommission() : (b.getAgreedCost() != null ? b.getAgreedCost() * 0.05 : 0.0))
                .sum();

        double workerNetEarnings = totalServiceVolume - platformCommission;

        double onlinePayments = allBookings.stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getPaymentStatus()) && !"CASH".equalsIgnoreCase(b.getPaymentMethod()))
                .mapToDouble(b -> b.getAgreedCost() != null ? b.getAgreedCost() : 0.0)
                .sum();

        double cashPayments = allBookings.stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getPaymentStatus()) && "CASH".equalsIgnoreCase(b.getPaymentMethod()))
                .mapToDouble(b -> b.getAgreedCost() != null ? b.getAgreedCost() : 0.0)
                .sum();

        double totalWalletBalances = allWallets.stream()
                .mapToDouble(w -> w.getBalance() != null ? w.getBalance() : 0.0)
                .sum();

        List<WalletTransaction> withdrawals = allTx.stream()
                .filter(t -> "WITHDRAWAL".equalsIgnoreCase(t.getTransactionType()))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalServiceVolume", Math.round(totalServiceVolume * 100.0) / 100.0);
        result.put("platformCommission", Math.round(platformCommission * 100.0) / 100.0);
        result.put("workerNetEarnings", Math.round(workerNetEarnings * 100.0) / 100.0);
        result.put("onlinePayments", Math.round(onlinePayments * 100.0) / 100.0);
        result.put("cashPayments", Math.round(cashPayments * 100.0) / 100.0);
        result.put("totalWalletBalances", Math.round(totalWalletBalances * 100.0) / 100.0);
        result.put("wallets", allWallets);
        result.put("withdrawals", withdrawals);
        result.put("transactions", allTx);

        return ResponseEntity.ok(result);
    }

    @PutMapping("/withdrawals/{id}/approve")
    public ResponseEntity<?> approveWithdrawal(@PathVariable Long id) {
        return transactionRepository.findById(id).map(tx -> {
            tx.setStatus("COMPLETED");
            transactionRepository.save(tx);

            auditLogRepository.save(new AuditLog(
                    "WITHDRAWAL_APPROVED",
                    "System Admin",
                    "ADMIN",
                    "WalletTransaction",
                    tx.getId(),
                    "Withdrawal #" + id + " of ৳" + Math.abs(tx.getAmount()) + " approved & disbursed to " + (tx.getWorker() != null ? tx.getWorker().getName() : "Worker")
            ));

            return ResponseEntity.ok(Map.of("message", "Withdrawal approved and disbursed successfully", "transaction", tx));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/withdrawals/{id}/reject")
    public ResponseEntity<?> rejectWithdrawal(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return transactionRepository.findById(id).map(tx -> {
            tx.setStatus("REJECTED");
            if (reason != null && !reason.isEmpty()) {
                tx.setDescription(tx.getDescription() + " [Rejected: " + reason + "]");
            }
            transactionRepository.save(tx);

            // Refund balance to worker's wallet
            if (tx.getWorker() != null) {
                double refundAmt = Math.abs(tx.getAmount());
                walletRepository.findByWorkerId(tx.getWorker().getId()).ifPresent(w -> {
                    w.setBalance(w.getBalance() + refundAmt);
                    w.setTotalWithdrawals(Math.max(0.0, w.getTotalWithdrawals() - refundAmt));
                    walletRepository.save(w);
                });
            }

            auditLogRepository.save(new AuditLog(
                    "WITHDRAWAL_REJECTED",
                    "System Admin",
                    "ADMIN",
                    "WalletTransaction",
                    tx.getId(),
                    "Withdrawal #" + id + " rejected. Funds refunded to worker wallet. Reason: " + reason
            ));

            return ResponseEntity.ok(Map.of("message", "Withdrawal rejected and balance refunded", "transaction", tx));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 6. ANALYTICS ENGINE
    // ==========================================

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(@RequestParam(defaultValue = "30D") String period) {
        List<ServiceBooking> bookings = bookingRepository.findAll();
        List<User> users = userRepository.findAll();
        List<StoreOrder> orders = orderRepository.findAll();
        List<Course> courses = courseRepository.findAll();
        List<CourseEnrollment> enrollments = enrollmentRepository.findAll();

        long completedCount = bookings.stream().filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus())).count();
        long cancelledCount = bookings.stream().filter(b -> "CANCELLED".equalsIgnoreCase(b.getStatus())).count();
        double cancellationRate = bookings.isEmpty() ? 0.0 : (double) cancelledCount / bookings.size() * 100.0;
        double avgBookingValue = completedCount == 0 ? 0.0 : bookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) || "PAID".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getAgreedCost() != null ? b.getAgreedCost() : 0.0).average().orElse(0.0);

        Map<String, Object> data = new HashMap<>();
        data.put("period", period);
        data.put("totalBookings", bookings.size());
        data.put("completedBookings", completedCount);
        data.put("cancellationRate", Math.round(cancellationRate * 10.0) / 10.0);
        data.put("avgBookingValue", Math.round(avgBookingValue));

        data.put("totalStoreOrders", orders.size());
        double totalStoreSales = orders.stream().mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0).sum();
        data.put("totalStoreSales", Math.round(totalStoreSales));

        data.put("totalCourses", courses.size());
        data.put("totalEnrollments", enrollments.size());
        long completedCourses = enrollments.stream().filter(e -> Boolean.TRUE.equals(e.getIsCompleted()) || (e.getProgressPercentage() != null && e.getProgressPercentage() >= 100)).count();
        data.put("completedCertifications", completedCourses);

        // Chart mock/aggregated data series based on period
        List<Map<String, Object>> revenueTrends = List.of(
                Map.of("label", "Week 1", "revenue", 18500, "commission", 925, "orders", 4200),
                Map.of("label", "Week 2", "revenue", 26400, "commission", 1320, "orders", 6100),
                Map.of("label", "Week 3", "revenue", 34200, "commission", 1710, "orders", 8300),
                Map.of("label", "Week 4", "revenue", 45800, "commission", 2290, "orders", 11200)
        );
        data.put("revenueTrends", revenueTrends);

        return ResponseEntity.ok(data);
    }

    // ==========================================
    // 7. AUDIT LOGS & ACTIVITY
    // ==========================================

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/logs")
    public ResponseEntity<AuditLog> createLog(@RequestBody AuditLog log) {
        if (log.getTimestamp() == null) log.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(auditLogRepository.save(log));
    }

    // ==========================================
    // 8. PLATFORM SETTINGS
    // ==========================================

    @GetMapping("/settings")
    public ResponseEntity<List<PlatformSetting>> getSettings() {
        return ResponseEntity.ok(settingRepository.findAll());
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> settingsMap) {
        for (Map.Entry<String, String> entry : settingsMap.entrySet()) {
            PlatformSetting setting = settingRepository.findBySettingKey(entry.getKey())
                    .orElse(new PlatformSetting(entry.getKey(), entry.getValue(), "Configuration for " + entry.getKey()));
            setting.setSettingValue(entry.getValue());
            setting.setUpdatedAt(LocalDateTime.now());
            settingRepository.save(setting);
        }

        auditLogRepository.save(new AuditLog(
                "SETTINGS_UPDATED",
                "System Admin",
                "ADMIN",
                "PlatformSetting",
                1L,
                "Platform settings updated with " + settingsMap.size() + " config values."
        ));

        return ResponseEntity.ok(Map.of("message", "Platform configuration updated successfully", "settings", settingRepository.findAll()));
    }
}

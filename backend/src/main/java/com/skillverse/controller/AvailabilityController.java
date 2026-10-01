package com.skillverse.controller;

import com.skillverse.model.User;
import com.skillverse.model.WorkerAvailabilitySlot;
import com.skillverse.repository.UserRepository;
import com.skillverse.repository.WorkerAvailabilitySlotRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "*")
public class AvailabilityController {

    private final WorkerAvailabilitySlotRepository slotRepository;
    private final UserRepository userRepository;

    public AvailabilityController(WorkerAvailabilitySlotRepository slotRepository, UserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
    }

    // Get all slots for a worker
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkerAvailabilitySlot>> getWorkerSlots(@PathVariable Long workerId) {
        return ResponseEntity.ok(slotRepository.findByWorkerIdOrderBySlotDateAscStartTimeAsc(workerId));
    }

    // Get available (unbooked, today or future) slots for a worker
    @GetMapping("/worker/{workerId}/available")
    public ResponseEntity<List<WorkerAvailabilitySlot>> getAvailableWorkerSlots(@PathVariable Long workerId) {
        LocalDate today = LocalDate.now();
        return ResponseEntity.ok(slotRepository.findByWorkerIdAndIsBookedFalseAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(workerId, today));
    }

    // Create a new time slot
    @PostMapping("/worker/{workerId}/slots")
    public ResponseEntity<?> createSlot(@PathVariable Long workerId, @RequestBody SlotRequest request) {
        Optional<User> workerOpt = userRepository.findById(workerId);
        if (workerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Worker not found"));
        }

        LocalDate slotDate;
        try {
            slotDate = LocalDate.parse(request.getSlotDate());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format. Use YYYY-MM-DD"));
        }

        if (slotRepository.existsByWorkerIdAndSlotDateAndStartTime(workerId, slotDate, request.getStartTime())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slot starting at " + request.getStartTime() + " on " + request.getSlotDate() + " already exists"));
        }

        WorkerAvailabilitySlot slot = new WorkerAvailabilitySlot(
                workerOpt.get(),
                slotDate,
                request.getStartTime(),
                request.getEndTime()
        );

        WorkerAvailabilitySlot saved = slotRepository.save(slot);
        return ResponseEntity.ok(saved);
    }

    // Delete a slot
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long slotId) {
        Optional<WorkerAvailabilitySlot> slotOpt = slotRepository.findById(slotId);
        if (slotOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        WorkerAvailabilitySlot slot = slotOpt.get();
        if (slot.isBooked()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete a slot that is already booked"));
        }

        slotRepository.delete(slot);
        return ResponseEntity.ok(Map.of("message", "Slot deleted successfully"));
    }

    // Generate quick standard slots for the next N days
    @PostMapping("/worker/{workerId}/generate-default-slots")
    public ResponseEntity<?> generateDefaultSlots(@PathVariable Long workerId, @RequestParam(defaultValue = "7") int days) {
        Optional<User> workerOpt = userRepository.findById(workerId);
        if (workerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Worker not found"));
        }

        User worker = workerOpt.get();
        LocalDate startDate = LocalDate.now();
        String[][] standardTimes = {
                {"09:00", "11:00"},
                {"11:00", "13:00"},
                {"14:00", "16:00"},
                {"16:00", "18:00"}
        };

        List<WorkerAvailabilitySlot> createdSlots = new ArrayList<>();

        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            for (String[] times : standardTimes) {
                String startTime = times[0];
                String endTime = times[1];
                if (!slotRepository.existsByWorkerIdAndSlotDateAndStartTime(workerId, date, startTime)) {
                    WorkerAvailabilitySlot slot = new WorkerAvailabilitySlot(worker, date, startTime, endTime);
                    createdSlots.add(slotRepository.save(slot));
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Generated default slots successfully",
                "createdCount", createdSlots.size()
        ));
    }

    public static class SlotRequest {
        private String slotDate;
        private String startTime;
        private String endTime;

        public String getSlotDate() { return slotDate; }
        public void setSlotDate(String slotDate) { this.slotDate = slotDate; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }
}

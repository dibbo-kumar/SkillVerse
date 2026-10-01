package com.skillverse.repository;

import com.skillverse.model.WorkerAvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkerAvailabilitySlotRepository extends JpaRepository<WorkerAvailabilitySlot, Long> {
    List<WorkerAvailabilitySlot> findByWorkerId(Long workerId);

    List<WorkerAvailabilitySlot> findByWorkerIdOrderBySlotDateAscStartTimeAsc(Long workerId);

    List<WorkerAvailabilitySlot> findByWorkerIdAndSlotDateOrderByStartTimeAsc(Long workerId, LocalDate slotDate);

    List<WorkerAvailabilitySlot> findByWorkerIdAndIsBookedFalseAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(Long workerId, LocalDate slotDate);

    boolean existsByWorkerIdAndSlotDateAndStartTime(Long workerId, LocalDate slotDate, String startTime);
}

package com.skillverse.repository;

import com.skillverse.model.ServiceBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {
    List<ServiceBooking> findByCustomerId(Long customerId);
    List<ServiceBooking> findByWorkerId(Long workerId);
    List<ServiceBooking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<ServiceBooking> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
    List<ServiceBooking> findAllByOrderByCreatedAtDesc();
}

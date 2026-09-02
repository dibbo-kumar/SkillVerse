package com.skillverse.repository;

import com.skillverse.model.StoreOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreOrderRepository extends JpaRepository<StoreOrder, Long> {
    List<StoreOrder> findByUserIdOrderByPlacedAtDesc(Long userId);
    Optional<StoreOrder> findByOrderNumber(String orderNumber);
    List<StoreOrder> findByServiceBookingId(Long serviceBookingId);
    List<StoreOrder> findAllByOrderByPlacedAtDesc();
}

package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByUserId(String userId);
}
package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId; // Links to the User who bought it
    private String userName;
    private String productName;
    private Double amount;
    private LocalDateTime orderDate;
    private String status; // e.g., "CONFIRMED"
}
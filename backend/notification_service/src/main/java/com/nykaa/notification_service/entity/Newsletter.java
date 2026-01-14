package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletters")
@Data
public class Newsletter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;       // e.g., "Nykaa Fashion Weekly"
    private String description; // e.g., "Curated fashion trends sent every Monday."
    private String createdBy;   // Admin/Creator ID who made this
    private LocalDateTime createdAt = LocalDateTime.now();
}
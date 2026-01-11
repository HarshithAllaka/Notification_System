package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
@Data // Generates getters, setters, toString, etc.
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campaignName;

    // --- NEW FIELDS ADDED ---
    private String type;     // EMAIL, SMS, PUSH
    
    @Column(length = 1000)   // Allow longer text for messages
    private String content;  
    
    private LocalDateTime createdAt;
}
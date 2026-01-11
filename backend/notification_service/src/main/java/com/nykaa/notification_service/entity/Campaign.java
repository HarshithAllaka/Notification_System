package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "campaigns")
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campaignName;
    private String type; // EMAIL, SMS, PUSH
    
    @Column(length = 1000)
    private String content;
    
    private String targetCity; // <--- ADD THIS
    
    private LocalDateTime createdAt;
}
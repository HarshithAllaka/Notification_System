package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "campaigns")
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campaignName;
    private String type; 
    
    @Column(length = 1000)
    private String content;
    
    @ElementCollection
    @CollectionTable(name = "campaign_target_cities", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "city")
    private List<String> targetCities; // Support multiple cities
    
    // Keep this for backward compatibility
    private String targetCity;
    
    private LocalDateTime createdAt;
}
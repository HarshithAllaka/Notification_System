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
    private String type; // e.g. "Promotion Offers"
    
    @Column(length = 1000)
    private String content;
    
    @ElementCollection
    @CollectionTable(name = "campaign_target_cities", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "city")
    private List<String> targetCities; 
    
    // --- NEW FIELD: STORE SELECTED CHANNELS ---
    @ElementCollection
    @CollectionTable(name = "campaign_channels", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "channel")
    private List<String> channels; 

    private String targetCity; 
    private LocalDateTime createdAt;
    private LocalDateTime scheduledAt;
    private String status = "SENT"; 
}
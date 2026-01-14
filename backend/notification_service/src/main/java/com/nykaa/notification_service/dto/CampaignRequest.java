package com.nykaa.notification_service.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CampaignRequest {
    private String name;
    private String type;
    private String content;
    
    // Kept your existing String field (optional/legacy)
    private String schedule; 
    
    private List<String> targetCities; 
    private List<String> channels; 

    // --- NEW FIELD FOR SCHEDULING ---
    // This expects format: "2026-01-20T10:00:00"
    private LocalDateTime scheduledAt; 
}
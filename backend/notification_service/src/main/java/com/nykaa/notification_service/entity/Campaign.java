package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
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
    private List<String> targetCities;
    
    private String targetCity;
    
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCampaignName() {
        return campaignName;
    }

    public void setCampaignName(String campaignName) {
        this.campaignName = campaignName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getTargetCities() {
        return targetCities;
    }

    public void setTargetCities(List<String> targetCities) {
        this.targetCities = targetCities;
    }

    public String getTargetCity() {
        return targetCity;
    }

    public void setTargetCity(String targetCity) {
        this.targetCity = targetCity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // For convenience, add getName() if needed for service logic
    public String getName() {
        return campaignName;
    }
}
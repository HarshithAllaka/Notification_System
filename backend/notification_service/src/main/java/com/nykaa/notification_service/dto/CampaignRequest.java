package com.nykaa.notification_service.dto;

import java.util.List;

public class CampaignRequest {
    private String name;
    private String type;
    private String content;
    private String schedule;
    private List<String> targetCities;

    // Constructors
    public CampaignRequest() {}

    public CampaignRequest(String name, String type, String content, String schedule, List<String> targetCities) {
        this.name = name;
        this.type = type;
        this.content = content;
        this.schedule = schedule;
        this.targetCities = targetCities;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public List<String> getTargetCities() {
        return targetCities;
    }

    public void setTargetCities(List<String> targetCities) {
        this.targetCities = targetCities;
    }
}
package com.nykaa.notification_service.dto;

import lombok.Data;

@Data
public class CampaignRequest {
    private String name;
    private String type;
    private String content;
    private String schedule;
    private String targetCity; // <--- ADD THIS
}
package com.nykaa.notification_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class CampaignRequest {
    private String name;
    private String type;
    private String content;
    private String schedule;
    private List<String> targetCities; // Support multiple cities
    private List<String> channels; // Channels to send: EMAIL, SMS, PUSH
}
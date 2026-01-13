package com.nykaa.notification_service.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class NotificationDto {
    private String message;     // The Campaign Name
    private String content;     // The Actual Message Content
    private String campaignType; // Promotion Offers, Newsletters, Order Updates
    private List<String> channels; // Channels used: EMAIL, SMS, PUSH
    private LocalDateTime receivedAt;

    // Constructors
    public NotificationDto() {}
    public NotificationDto(String message, String content, String campaignType, List<String> channels, LocalDateTime receivedAt) {
        this.message = message;
        this.content = content;
        this.campaignType = campaignType;
        this.channels = channels;
        this.receivedAt = receivedAt;
    }
}
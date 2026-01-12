package com.nykaa.notification_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private String message;     // The Campaign Name
    private String content;     // The Actual Message Content
    private String type;        // <--- ADD THIS (SMS/EMAIL/PUSH)
    private LocalDateTime receivedAt;

    // Constructors
    public NotificationDto() {}
    public NotificationDto(String message, String content, String type, String receivedAt) {
        this.message = message;
        this.content = content;
        this.type = type;
        this.receivedAt = LocalDateTime.parse(receivedAt);
    }
}
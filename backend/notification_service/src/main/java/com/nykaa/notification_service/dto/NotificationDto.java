package com.nykaa.notification_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private String message; // The Campaign Name (e.g., "Diwali Sale")
    private LocalDateTime receivedAt;
}
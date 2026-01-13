package com.nykaa.notification_service.dto;

import java.time.LocalDateTime;

public class NotificationDto {
    private String message;
    private String content;
    private String type;
    private LocalDateTime receivedAt;

    // Constructors
    public NotificationDto() {}

    public NotificationDto(String message, String content, String type, LocalDateTime receivedAt) {
        this.message = message;
        this.content = content;
        this.type = type;
        this.receivedAt = receivedAt;
    }

    public NotificationDto(String message, String content, String type, String receivedAt) {
        this.message = message;
        this.content = content;
        this.type = type;
        this.receivedAt = LocalDateTime.parse(receivedAt);
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }
}
package com.nykaa.notification_service.dto;

public class RecipientDto {
    private String name;
    private String email;
    private String status;
    private String sentAt;

    // Constructors
    public RecipientDto() {}

    public RecipientDto(String name, String email, String status, String sentAt) {
        this.name = name;
        this.email = email;
        this.status = status;
        this.sentAt = sentAt;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSentAt() {
        return sentAt;
    }

    public void setSentAt(String sentAt) {
        this.sentAt = sentAt;
    }
}
package com.nykaa.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecipientDto {
    private String name;
    private String email;
    private String status; // "SENT"
    private String sentAt;
    private String channel; // EMAIL, SMS, PUSH
}
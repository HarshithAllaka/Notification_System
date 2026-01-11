package com.nykaa.notification_service.dto;

import com.nykaa.notification_service.entity.Role;
import lombok.Data;

@Data
public class CreateStaffRequest {
    private String name;
    private String email;
    private String password;
    private Role role; // We will choose CREATOR or VIEWER
}
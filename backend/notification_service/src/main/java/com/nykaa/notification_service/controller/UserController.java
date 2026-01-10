package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.service.UserService;
import com.nykaa.notification_service.service.CsvService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CsvService csvService;

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CREATOR')")
    public ResponseEntity<String> uploadUsers(@RequestBody List<User> users) {
        if (users.size() > 50) {
            return ResponseEntity.badRequest().body("Use CSV upload for more than 50 users.");
        }
        userService.saveUsers(users);
        return ResponseEntity.ok("Users uploaded successfully.");
    }

    @PostMapping("/upload-csv")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CREATOR')")
    public ResponseEntity<String> uploadCsv(@RequestParam("file") MultipartFile file) {
        try {
            List<User> users = csvService.parseCsv(file);
            userService.saveUsers(users);
            return ResponseEntity.ok("Bulk upload successful for " + users.size() + " users.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing CSV: " + e.getMessage());
        }
    }
}
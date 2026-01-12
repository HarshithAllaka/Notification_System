package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.dto.NotificationDto;
import com.nykaa.notification_service.entity.NotificationLog;
import com.nykaa.notification_service.entity.Preference;
import com.nykaa.notification_service.entity.Campaign;
import com.nykaa.notification_service.repository.CampaignRepository;
import com.nykaa.notification_service.repository.NotificationLogRepository;
import com.nykaa.notification_service.repository.PreferenceRepository;
import com.nykaa.notification_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final NotificationLogRepository logRepository;
    private final CampaignRepository campaignRepository;

    // Helper to get current logged-in user's email from the security token
    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    // 1. Get My Preferences
    @GetMapping("/preferences")
    public ResponseEntity<Preference> getMyPreferences() {
        String email = getCurrentUserEmail();
        // Find the user ID based on email
        String userId = userRepository.findByEmail(email).get().getUserId();
        // Use the repository we just created
        return ResponseEntity.ok(preferenceRepository.findByUserUserId(userId));
    }

    // 2. Update My Preferences
    @PutMapping("/preferences")
    public ResponseEntity<Preference> updatePreferences(@RequestBody Preference updatedPref) {
        String email = getCurrentUserEmail();
        String userId = userRepository.findByEmail(email).get().getUserId();
        
        Preference existing = preferenceRepository.findByUserUserId(userId);
        existing.setOffers(updatedPref.isOffers());
        existing.setNewsletter(updatedPref.isNewsletter());
        existing.setOrderUpdates(updatedPref.isOrderUpdates());
        
        return ResponseEntity.ok(preferenceRepository.save(existing));
    }

    // 3. Get My Notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        String email = getCurrentUserEmail();
        String userId = userRepository.findByEmail(email).get().getUserId();

        List<NotificationLog> logs = logRepository.findAll().stream()
                .filter(log -> log.getUserId().equals(userId))
                .collect(Collectors.toList());

        List<NotificationDto> notifications = logs.stream().map(log -> {
            Campaign c = campaignRepository.findById(log.getCampaignId()).orElse(null);
            NotificationDto dto = new NotificationDto();
            if (c != null) {
                dto.setMessage(c.getCampaignName());
                dto.setContent(c.getContent());
                dto.setType(c.getType()); // <--- SET THE TYPE HERE
            } else {
                dto.setMessage("System Message");
                dto.setContent("Notification details unavailable");
                dto.setType("PUSH");
            }
            dto.setReceivedAt(log.getSentAt());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(notifications);
    }
}
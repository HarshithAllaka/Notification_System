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
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

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
        existing.setEmailOffers(updatedPref.isEmailOffers());
        existing.setSmsOffers(updatedPref.isSmsOffers());
        existing.setPushOffers(updatedPref.isPushOffers());
        existing.setEmailNewsletters(updatedPref.isEmailNewsletters());
        existing.setSmsNewsletters(updatedPref.isSmsNewsletters());
        existing.setPushNewsletters(updatedPref.isPushNewsletters());
        existing.setEmailOrders(updatedPref.isEmailOrders());
        existing.setSmsOrders(updatedPref.isSmsOrders());
        existing.setPushOrders(updatedPref.isPushOrders());
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

        // Group by campaignId
        Map<Long, List<NotificationLog>> groupedLogs = logs.stream()
                .collect(Collectors.groupingBy(NotificationLog::getCampaignId));

        List<NotificationDto> notifications = groupedLogs.entrySet().stream().map(entry -> {
            Long campaignId = entry.getKey();
            List<NotificationLog> campaignLogs = entry.getValue();
            Campaign c = campaignRepository.findById(campaignId).orElse(null);
            if (c == null) return null;

            List<String> channels = campaignLogs.stream()
                    .map(NotificationLog::getChannel)
                    .distinct()
                    .collect(Collectors.toList());

            LocalDateTime latestSentAt = campaignLogs.stream()
                    .map(NotificationLog::getSentAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(LocalDateTime.now());

            return new NotificationDto(c.getCampaignName(), c.getContent(), c.getType(), channels, latestSentAt);
        }).filter(Objects::nonNull).collect(Collectors.toList());

        return ResponseEntity.ok(notifications);
    }
}
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
import java.util.ArrayList;
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

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @GetMapping("/preferences")
    public ResponseEntity<Preference> getMyPreferences() {
        String email = getCurrentUserEmail();
        String userId = userRepository.findByEmail(email).get().getUserId();
        return ResponseEntity.ok(preferenceRepository.findByUserUserId(userId));
    }

    @PutMapping("/preferences")
    public ResponseEntity<Preference> updatePreferences(@RequestBody Preference updatedPref) {
        String email = getCurrentUserEmail();
        String userId = userRepository.findByEmail(email).get().getUserId();
        
        Preference existing = preferenceRepository.findByUserUserId(userId);
        if(existing == null) return ResponseEntity.badRequest().build();

        // 1. Update Granular Fields (The specific checkboxes)
        existing.setEmailOffers(updatedPref.isEmailOffers());
        existing.setSmsOffers(updatedPref.isSmsOffers());
        existing.setPushOffers(updatedPref.isPushOffers());
        
        existing.setEmailNewsletters(updatedPref.isEmailNewsletters());
        existing.setSmsNewsletters(updatedPref.isSmsNewsletters());
        existing.setPushNewsletters(updatedPref.isPushNewsletters());
        
        existing.setEmailOrders(updatedPref.isEmailOrders());
        existing.setSmsOrders(updatedPref.isSmsOrders());
        existing.setPushOrders(updatedPref.isPushOrders());

        // 2. AUTO-SYNC MASTER SWITCHES (The Logic You Requested)
        // If at least one channel is TRUE, Master is TRUE. 
        // If ALL channels are FALSE, Master is automatically FALSE.
        
        existing.setOffers(existing.isEmailOffers() || existing.isSmsOffers() || existing.isPushOffers());
        existing.setNewsletter(existing.isEmailNewsletters() || existing.isSmsNewsletters() || existing.isPushNewsletters());
        existing.setOrderUpdates(existing.isEmailOrders() || existing.isSmsOrders() || existing.isPushOrders());

        return ResponseEntity.ok(preferenceRepository.save(existing));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        String email = getCurrentUserEmail();
        String userId = userRepository.findByEmail(email).get().getUserId();

        List<NotificationLog> logs = logRepository.findAll().stream()
                .filter(log -> log.getUserId().equals(userId))
                .collect(Collectors.toList());

        List<NotificationDto> finalNotifications = new ArrayList<>();

        // 1. CAMPAIGNS (ID != 0)
        Map<Long, List<NotificationLog>> groupedCampaignLogs = logs.stream()
                .filter(log -> log.getCampaignId() != null && log.getCampaignId() != 0)
                .collect(Collectors.groupingBy(NotificationLog::getCampaignId));

        groupedCampaignLogs.forEach((campaignId, campaignLogs) -> {
            Campaign c = campaignRepository.findById(campaignId).orElse(null);
            if (c != null) {
                List<String> channels = campaignLogs.stream().map(NotificationLog::getChannel).distinct().collect(Collectors.toList());
                LocalDateTime latestTime = campaignLogs.stream().map(NotificationLog::getSentAt).max(LocalDateTime::compareTo).orElse(LocalDateTime.now());
                finalNotifications.add(new NotificationDto(c.getCampaignName(), c.getContent(), c.getType(), channels, latestTime));
            }
        });

        // 2. ORDERS (ID == 0 or NULL)
        List<NotificationLog> orderLogs = logs.stream()
                .filter(log -> log.getCampaignId() == null || log.getCampaignId() == 0)
                .collect(Collectors.toList());

        for (NotificationLog log : orderLogs) {
            // Only add if we have a message text (prevents empty boxes)
            String title = (log.getMessage() != null) ? log.getMessage() : "Order Update";
            String body = (log.getContent() != null) ? log.getContent() : "Status updated";
            
            // Only add if the message content actually exists (avoids null pointers)
            if(log.getMessage() != null || log.getContent() != null) {
                finalNotifications.add(new NotificationDto(
                    title, 
                    body, 
                    "Order Updates", 
                    List.of(log.getChannel()), 
                    log.getSentAt()
                ));
            }
        }

        finalNotifications.sort((a, b) -> b.getReceivedAt().compareTo(a.getReceivedAt()));
        return ResponseEntity.ok(finalNotifications);
    }
}
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

        // 1. Update Granular Fields
        existing.setEmailOffers(updatedPref.isEmailOffers());
        existing.setSmsOffers(updatedPref.isSmsOffers());
        existing.setPushOffers(updatedPref.isPushOffers());
        existing.setEmailNewsletters(updatedPref.isEmailNewsletters());
        existing.setSmsNewsletters(updatedPref.isSmsNewsletters());
        existing.setPushNewsletters(updatedPref.isPushNewsletters());
        existing.setEmailOrders(updatedPref.isEmailOrders());
        existing.setSmsOrders(updatedPref.isSmsOrders());
        existing.setPushOrders(updatedPref.isPushOrders());

        // 2. Auto-Sync Master Switches
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

        // 1. CAMPAIGNS (Grouped by Campaign ID)
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

        // 2. ORDERS (Grouped by Unique Content) -- FIX IS HERE
        List<NotificationLog> orderLogs = logs.stream()
                .filter(log -> log.getCampaignId() == null || log.getCampaignId() == 0)
                .collect(Collectors.toList());

        // We group by "Message + Content" to combine the 3 logs (Email/SMS/Push) into one
        Map<String, List<NotificationLog>> groupedOrderLogs = orderLogs.stream()
                .filter(log -> log.getMessage() != null && log.getContent() != null)
                .collect(Collectors.groupingBy(log -> log.getMessage() + "|||" + log.getContent()));

        groupedOrderLogs.forEach((key, uniqueLogs) -> {
            // Get all channels for this specific message
            List<String> channels = uniqueLogs.stream().map(NotificationLog::getChannel).distinct().collect(Collectors.toList());
            
            // Get the details from the first log in the group
            NotificationLog firstLog = uniqueLogs.get(0);
            
            finalNotifications.add(new NotificationDto(
                firstLog.getMessage(), 
                firstLog.getContent(), 
                "Order Updates", 
                channels, // Now sends ["EMAIL", "SMS", "PUSH"] in one object
                firstLog.getSentAt()
            ));
        });

        finalNotifications.sort((a, b) -> b.getReceivedAt().compareTo(a.getReceivedAt()));
        return ResponseEntity.ok(finalNotifications);
    }
}
package com.nykaa.notification_service.service;

import com.nykaa.notification_service.entity.*;
import com.nykaa.notification_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final NotificationLogRepository logRepository;

    public List<User> resolveTargets(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        return userRepository.findAll().stream()
            .filter(User::isActive)
            .filter(user -> matchesPreference(user, campaign.getNotificationType()))
            .filter(user -> matchesCity(user, campaign.getCityFilter()))
            .collect(Collectors.toList());
    }

    private boolean matchesPreference(User user, String type) {
        Preference p = user.getPreference();
        if (p == null) return false;
        String typeLower = type == null ? "" : type.toLowerCase();
        return switch (typeLower) {
            case "offers" -> p.isOffers();
            case "order_updates" -> p.isOrderUpdates();
            case "newsletter" -> p.isNewsletter();
            default -> false;
        };
    }

    private boolean matchesCity(User user, String cityFilter) {
        if (cityFilter == null || cityFilter.trim().isEmpty()) return true;
        if (user.getCity() == null) return false;
        return cityFilter.equalsIgnoreCase(user.getCity());
    }

    public void sendMockNotifications(Long campaignId) {
        List<User> targets = resolveTargets(campaignId);
        for (User user : targets) {
            NotificationLog log = new NotificationLog();
            log.setUserId(user.getUserId());
            log.setCampaignId(campaignId);
            log.setSentAt(LocalDateTime.now());
            log.setStatus("success");
            logRepository.save(log);
        }
        
        Campaign campaign = campaignRepository.findById(campaignId).orElseThrow();
        campaign.setStatus(CampaignStatus.SENT);
        campaignRepository.save(campaign);
    }
}
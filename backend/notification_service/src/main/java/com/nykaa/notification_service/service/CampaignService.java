package com.nykaa.notification_service.service;

import com.nykaa.notification_service.dto.CampaignRequest;
import com.nykaa.notification_service.dto.RecipientDto;
import com.nykaa.notification_service.entity.*;
import com.nykaa.notification_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final NotificationLogRepository logRepository;

    public void executeCampaign(CampaignRequest request) {
        System.out.println("Executing campaign with target cities: " + request.getTargetCities());
        Campaign campaign = new Campaign();
        campaign.setCampaignName(request.getName());
        campaign.setType(request.getType());
        campaign.setContent(request.getContent());
        campaign.setTargetCities(request.getTargetCities()); // Save target cities
        campaign.setCreatedAt(LocalDateTime.now());
        campaignRepository.save(campaign);

        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!user.isActive()) continue;

            // --- CITY FILTER LOGIC FOR MULTIPLE CITIES ---
            // Check targetCities (new format)
            if (request.getTargetCities() != null && !request.getTargetCities().isEmpty()) {
                // If "All Cities" is selected, skip the city filter
                if (!request.getTargetCities().contains("All Cities")) {
                    // Check if user's city is in the target cities list
                    if (user.getCity() == null || 
                        !request.getTargetCities().stream()
                            .anyMatch(city -> city.equalsIgnoreCase(user.getCity()))) {
                        System.out.println("Skipping user " + user.getUserId() + " in city " + user.getCity() + " for target cities " + request.getTargetCities());
                        continue; // Skip this user if their city is not in target list
                    }
                }
            } else {
                System.out.println("No target cities specified, sending to all");
            }
            // -----------------------------------------------

            Preference pref = preferenceRepository.findByUserUserId(user.getUserId());
            if (pref == null) continue;

            boolean shouldSend = false;
            if ("EMAIL".equalsIgnoreCase(request.getType()) && pref.isNewsletter()) shouldSend = true;
            else if ("SMS".equalsIgnoreCase(request.getType()) && pref.isOffers()) shouldSend = true;
            else if ("PUSH".equalsIgnoreCase(request.getType()) && pref.isOrderUpdates()) shouldSend = true;
            else if (request.getType() == null) shouldSend = true;

            if (shouldSend) {
                NotificationLog log = new NotificationLog();
                log.setCampaignId(campaign.getId());
                log.setUserId(user.getUserId());
                log.setStatus("SENT");
                log.setSentAt(LocalDateTime.now());
                logRepository.save(log);
            }
        }
    }

    // ... (Keep existing getAllCampaigns, getRecipients, deleteCampaign methods exactly as they were) ...
    public List<Campaign> getAllCampaigns() { return campaignRepository.findAll(); }

    public List<RecipientDto> getCampaignRecipients(Long campaignId) {
        List<NotificationLog> logs = logRepository.findByCampaignId(campaignId);
        List<RecipientDto> report = new ArrayList<>();
        for (NotificationLog log : logs) {
            userRepository.findById(log.getUserId()).ifPresent(user -> {
                report.add(new RecipientDto(user.getName(), user.getEmail(), log.getStatus(), log.getSentAt().toString()));
            });
        }
        return report;
    }

    @Transactional
    public void deleteCampaign(Long id) {
        List<NotificationLog> logs = logRepository.findByCampaignId(id);
        logRepository.deleteAll(logs);
        campaignRepository.deleteById(id);
    }

    // Update Campaign with multiple cities support
    public Campaign updateCampaign(Long id, CampaignRequest request) {
        Campaign existing = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));
        
        existing.setCampaignName(request.getName());
        existing.setType(request.getType());
        existing.setContent(request.getContent());
        existing.setTargetCities(request.getTargetCities()); // Update target cities
        
        return campaignRepository.save(existing);
    }
}
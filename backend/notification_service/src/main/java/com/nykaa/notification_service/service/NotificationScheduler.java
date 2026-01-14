package com.nykaa.notification_service.service;

import com.nykaa.notification_service.entity.*;
import com.nykaa.notification_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationScheduler {

    private final CampaignRepository campaignRepository;
    private final NewsletterPostRepository postRepository;
    private final UserRepository userRepository;
    private final NewsletterSubscriptionRepository subscriptionRepository;
    private final NotificationLogRepository logRepository;
    private final PreferenceRepository preferenceRepository;

    // Runs every 60 seconds (60000 ms)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processScheduledNotifications() {
        LocalDateTime now = LocalDateTime.now();
        
        processCampaigns(now);
        processNewsletterPosts(now);
    }

    private void processCampaigns(LocalDateTime now) {
        List<Campaign> pendingCampaigns = campaignRepository.findAll().stream()
                .filter(c -> "SCHEDULED".equals(c.getStatus()) && c.getScheduledAt() != null && c.getScheduledAt().isBefore(now))
                .collect(Collectors.toList());

        for (Campaign c : pendingCampaigns) {
            List<User> targets;
            if (c.getTargetCities() != null && !c.getTargetCities().isEmpty()) {
                targets = userRepository.findByCityIn(c.getTargetCities());
            } else if (c.getTargetCity() != null) {
                targets = userRepository.findByCity(c.getTargetCity());
            } else {
                targets = userRepository.findAll();
            }

            int count = 0;
            for (User user : targets) {
                // Check if we should send based on stored channels and user prefs
                List<String> validChannels = getValidChannelsForUser(user, c);
                
                if (!validChannels.isEmpty()) {
                    // Create a log for EACH valid channel
                    for (String channel : validChannels) {
                        createCampaignLog(user, c, channel);
                    }
                    count++;
                }
            }
            
            c.setStatus("SENT");
            campaignRepository.save(c);
            System.out.println("Scheduler: Sent Campaign '" + c.getCampaignName() + "' to " + count + " users.");
        }
    }

    // New Helper to determine channels
    private List<String> getValidChannelsForUser(User user, Campaign c) {
        Preference pref = preferenceRepository.findByUserUserId(user.getUserId());
        if (pref == null) return List.of();

        // Get the channels the ADMIN selected for this campaign
        List<String> campaignChannels = c.getChannels(); 
        if (campaignChannels == null || campaignChannels.isEmpty()) return List.of();

        // Filter them by what the USER has opted into
        return campaignChannels.stream().filter(channel -> {
            if ("EMAIL".equalsIgnoreCase(channel)) return pref.isEmailOffers();
            if ("SMS".equalsIgnoreCase(channel)) return pref.isSmsOffers();
            if ("PUSH".equalsIgnoreCase(channel)) return pref.isPushOffers();
            return false;
        }).collect(Collectors.toList());
    }

    // Updated Log Creator to accept specific channel
    private void createCampaignLog(User user, Campaign c, String channel) {
        NotificationLog log = new NotificationLog();
        log.setUserId(user.getUserId());
        log.setCampaignId(c.getId());
        log.setChannel(channel); // Use the specific channel
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        log.setMessage(c.getCampaignName());
        log.setContent(c.getContent());
        logRepository.save(log);
    }

    private void processNewsletterPosts(LocalDateTime now) {
        // Find posts that are SCHEDULED and due
        List<NewsletterPost> pendingPosts = postRepository.findAll().stream()
                .filter(p -> "SCHEDULED".equals(p.getStatus()) && p.getScheduledAt() != null && p.getScheduledAt().isBefore(now))
                .collect(Collectors.toList());

        for (NewsletterPost post : pendingPosts) {
            List<NewsletterSubscription> subs = subscriptionRepository.findByNewsletterId(post.getNewsletter().getId());
            int count = 0;

            for (NewsletterSubscription sub : subs) {
                User user = userRepository.findByUserId(sub.getUserId()).orElse(null);
                if (user == null) continue;

                Preference pref = preferenceRepository.findByUserUserId(user.getUserId());
                if (pref == null) continue;

                boolean sent = false;
                // Check Global Permissions
                if (pref.isEmailNewsletters()) { createNewsletterLog(user, "EMAIL", post); sent = true; }
                if (pref.isSmsNewsletters())   { createNewsletterLog(user, "SMS", post); sent = true; }
                if (pref.isPushNewsletters())  { createNewsletterLog(user, "PUSH", post); sent = true; }

                if (sent) count++;
            }

            post.setStatus("SENT");
            post.setRecipientsCount(count);
            postRepository.save(post);
            System.out.println("Scheduler: Sent Newsletter Post '" + post.getTitle() + "' to " + count + " subscribers.");
        }
    }

    // --- Helpers ---

    private boolean shouldSendCampaign(User user, String type) {
        Preference pref = preferenceRepository.findByUserUserId(user.getUserId());
        if (pref == null) return false;

        // Check the specific channel preference for Promotions
        switch (type) {
            case "SMS": return pref.isSmsOffers();
            case "EMAIL": return pref.isEmailOffers();
            case "PUSH": return pref.isPushOffers();
            default: return false;
        }
    }

    private void createCampaignLog(User user, Campaign c) {
        NotificationLog log = new NotificationLog();
        log.setUserId(user.getUserId());
        log.setCampaignId(c.getId());
        log.setChannel(c.getType());
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now()); // Log the actual send time
        log.setMessage(c.getCampaignName());
        log.setContent(c.getContent());
        logRepository.save(log);
    }

    private void createNewsletterLog(User user, String channel, NewsletterPost post) {
        NotificationLog log = new NotificationLog();
        log.setUserId(user.getUserId());
        log.setCampaignId(-1L);
        log.setNewsletterPostId(post.getId());
        log.setChannel(channel);
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        log.setMessage(post.getNewsletter().getTitle() + ": " + post.getTitle());
        log.setContent(post.getContent());
        logRepository.save(log);
    }
}
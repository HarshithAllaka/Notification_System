package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.entity.*;
import com.nykaa.notification_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/newsletters")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterRepository newsletterRepository;
    private final NewsletterSubscriptionRepository subscriptionRepository;
    private final NewsletterPostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationLogRepository logRepository;

    // --- 1. ADMIN/CREATOR: Manage Newsletters ---

    @PostMapping("/create")
    public ResponseEntity<Newsletter> createNewsletter(@RequestBody Newsletter newsletter) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        newsletter.setCreatedBy(admin.getUserId());
        newsletter.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(newsletterRepository.save(newsletter));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Newsletter>> getAllNewsletters() {
        return ResponseEntity.ok(newsletterRepository.findAll());
    }

    // --- 2. USER: Subscribe / Unsubscribe ---

    @GetMapping("/my-subscriptions")
    public ResponseEntity<List<NewsletterSubscription>> getMySubscriptions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(subscriptionRepository.findByUserId(user.getUserId()));
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<?> subscribe(@PathVariable Long id, @RequestBody NewsletterSubscription pref) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Newsletter newsletter = newsletterRepository.findById(id).orElseThrow(() -> new RuntimeException("Newsletter not found"));

        // Check if already subscribed
        Optional<NewsletterSubscription> existing = subscriptionRepository.findByUserIdAndNewsletterId(user.getUserId(), id);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Already subscribed");
        }

        NewsletterSubscription sub = new NewsletterSubscription();
        sub.setUserId(user.getUserId());
        sub.setNewsletter(newsletter);
        sub.setReceiveEmail(pref.isReceiveEmail());
        sub.setReceiveSms(pref.isReceiveSms());
        sub.setReceivePush(pref.isReceivePush());
        
        subscriptionRepository.save(sub);
        return ResponseEntity.ok("Subscribed successfully");
    }

    @PutMapping("/subscription/{subId}")
    public ResponseEntity<?> updateSubscription(@PathVariable Long subId, @RequestBody NewsletterSubscription updates) {
        NewsletterSubscription sub = subscriptionRepository.findById(subId).orElseThrow(() -> new RuntimeException("Subscription not found"));
        sub.setReceiveEmail(updates.isReceiveEmail());
        sub.setReceiveSms(updates.isReceiveSms());
        sub.setReceivePush(updates.isReceivePush());
        subscriptionRepository.save(sub);
        return ResponseEntity.ok("Preferences updated");
    }

    // --- 3. CREATOR: Publish a Post ---

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishPost(@PathVariable Long id, @RequestBody NewsletterPost post) {
        Newsletter newsletter = newsletterRepository.findById(id).orElseThrow(() -> new RuntimeException("Newsletter not found"));
        
        // 1. Save the Post first to generate an ID
        post.setNewsletter(newsletter);
        post.setSentAt(LocalDateTime.now());
        NewsletterPost savedPost = postRepository.save(post);

        // 2. Send to Subscribers
        List<NewsletterSubscription> subscribers = subscriptionRepository.findByNewsletterId(id);
        int count = 0;

        for (NewsletterSubscription sub : subscribers) {
            boolean sent = false;
            // Check granular preferences for this specific newsletter
            if (sub.isReceiveEmail()) { createLog(sub.getUserId(), "EMAIL", savedPost); sent = true; }
            if (sub.isReceiveSms())   { createLog(sub.getUserId(), "SMS", savedPost); sent = true; }
            if (sub.isReceivePush())  { createLog(sub.getUserId(), "PUSH", savedPost); sent = true; }
            
            if (sent) count++;
        }
        
        savedPost.setRecipientsCount(count);
        postRepository.save(savedPost);

        return ResponseEntity.ok("Published to " + count + " subscribers.");
    }

    private void createLog(String userId, String channel, NewsletterPost post) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setChannel(channel);
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        
        // -1 Flag tells Frontend this is a Newsletter
        log.setCampaignId(-1L); 
        // We link to the post ID for tracking
        log.setNewsletterPostId(post.getId());
        
        log.setMessage(post.getTitle());
        log.setContent(post.getContent());
        
        logRepository.save(log);
    }
}
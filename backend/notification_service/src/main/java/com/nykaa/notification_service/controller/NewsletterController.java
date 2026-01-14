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
    private final PreferenceRepository preferenceRepository; 

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
    public ResponseEntity<?> subscribe(@PathVariable Long id) {
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
        // Default flags (actual delivery logic is handled by Global Preferences now)
        sub.setReceiveEmail(true);
        sub.setReceiveSms(true);
        sub.setReceivePush(true);
        
        subscriptionRepository.save(sub);
        return ResponseEntity.ok("Subscribed successfully");
    }

    @DeleteMapping("/{id}/unsubscribe")
    public ResponseEntity<?> unsubscribe(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<NewsletterSubscription> existing = subscriptionRepository.findByUserIdAndNewsletterId(user.getUserId(), id);
        if (existing.isPresent()) {
            subscriptionRepository.delete(existing.get());
            return ResponseEntity.ok("Unsubscribed successfully");
        }
        return ResponseEntity.badRequest().body("Subscription not found");
    }

    // --- 3. CREATOR: Publish a Post (Updated for Scheduling) ---

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishPost(@PathVariable Long id, @RequestBody NewsletterPost post) {
        Newsletter newsletter = newsletterRepository.findById(id).orElseThrow(() -> new RuntimeException("Newsletter not found"));
        
        post.setNewsletter(newsletter);
        
        // --- NEW SCHEDULING LOGIC ---
        if (post.getScheduledAt() != null) {
            // Case 1: Scheduled Future Post
            post.setStatus("SCHEDULED");
            // NOTE: We do NOT set sentAt yet. The Scheduler will set it when it runs.
            postRepository.save(post);
            return ResponseEntity.ok("Post scheduled for " + post.getScheduledAt());
        } 
        else {
            // Case 2: Immediate Publish (Standard Logic)
            post.setStatus("SENT");
            post.setSentAt(LocalDateTime.now());
            NewsletterPost savedPost = postRepository.save(post);

            // Send to Subscribers based on GLOBAL PREFERENCES
            List<NewsletterSubscription> subscribers = subscriptionRepository.findByNewsletterId(id);
            int count = 0;

            for (NewsletterSubscription sub : subscribers) {
                String userId = sub.getUserId();
                
                // FETCH GLOBAL PREFERENCES
                Preference globalPref = preferenceRepository.findByUserUserId(userId);
                
                if (globalPref != null) {
                    boolean sent = false;
                    // Logic: Check Global Preference -> Send Notification
                    if (globalPref.isEmailNewsletters()) { 
                        createLog(userId, "EMAIL", savedPost); 
                        sent = true; 
                    }
                    if (globalPref.isSmsNewsletters()) { 
                        createLog(userId, "SMS", savedPost); 
                        sent = true; 
                    }
                    if (globalPref.isPushNewsletters()) { 
                        createLog(userId, "PUSH", savedPost); 
                        sent = true; 
                    }
                    
                    if (sent) count++;
                }
            }
            
            savedPost.setRecipientsCount(count);
            postRepository.save(savedPost);

            return ResponseEntity.ok("Published immediately to " + count + " subscribers.");
        }
    }

    private void createLog(String userId, String channel, NewsletterPost post) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setChannel(channel);
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        
        log.setCampaignId(-1L); 
        log.setNewsletterPostId(post.getId());
        log.setMessage(post.getTitle());
        log.setContent(post.getContent());
        
        logRepository.save(log);
    }

    // --- 4. VIEW & MANAGE POSTS (New) ---

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<NewsletterPost>> getPosts(@PathVariable Long id) {
        return ResponseEntity.ok(postRepository.findByNewsletterId(id));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.badRequest().body("Post not found");
        }
        postRepository.deleteById(postId);
        return ResponseEntity.ok("Post deleted successfully");
    }
}
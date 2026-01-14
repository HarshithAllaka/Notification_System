package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.NewsletterSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NewsletterSubscriptionRepository extends JpaRepository<NewsletterSubscription, Long> {
    // Find all subscriptions for a specific user
    List<NewsletterSubscription> findByUserId(String userId);
    
    // Find all subscribers for a specific newsletter (used when sending posts)
    List<NewsletterSubscription> findByNewsletterId(Long newsletterId);

    // Check if user is already subscribed
    Optional<NewsletterSubscription> findByUserIdAndNewsletterId(String userId, Long newsletterId);
}
package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "newsletter_subscriptions")
@Data
public class NewsletterSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId; // The subscriber

    @ManyToOne
    @JoinColumn(name = "newsletter_id")
    private Newsletter newsletter;

    // Granular Preferences for THIS specific subscription
    private boolean receiveEmail = true;
    private boolean receiveSms = false;  // Default off to save cost?
    private boolean receivePush = true;
}
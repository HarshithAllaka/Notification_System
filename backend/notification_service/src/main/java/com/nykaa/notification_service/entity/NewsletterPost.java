package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_posts")
@Data
public class NewsletterPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "newsletter_id")
    private Newsletter newsletter;

    private String title;   // e.g., "Winter Collection is Here!"
    @Column(columnDefinition = "TEXT")
    private String content; // The actual body text

    private LocalDateTime sentAt = LocalDateTime.now();
    private int recipientsCount; // For analytics
}
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

    private String title;   
    @Column(columnDefinition = "TEXT")
    private String content; 

    private LocalDateTime sentAt = LocalDateTime.now();
    private int recipientsCount; 

    // --- NEW FIELDS FOR SCHEDULING ---
    private LocalDateTime scheduledAt;
    
    // Status: "SENT", "SCHEDULED"
    private String status = "SENT"; 
}
package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    
    // 0 = Transactional (Order), >0 = Marketing Campaign, -1 = Newsletter (Legacy/Fallback)
    private Long campaignId; 
    
    // --- NEW FIELD FOR NEWSLETTERS ---
    private Long newsletterPostId; // Links to the specific issue/post
    
    private LocalDateTime sentAt;
    private String status;
    private String channel; // EMAIL, SMS, PUSH
    
    // --- CONTENT STORAGE ---
    @Column(columnDefinition = "TEXT") 
    private String message; // Title
    
    @Column(columnDefinition = "TEXT")
    private String content; // Body
}
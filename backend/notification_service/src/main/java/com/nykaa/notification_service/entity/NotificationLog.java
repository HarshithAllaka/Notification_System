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
    
    // 0 = Transactional (Order), >0 = Marketing Campaign
    private Long campaignId; 
    
    private LocalDateTime sentAt;
    private String status;
    private String channel; // EMAIL, SMS, PUSH
    
    // --- THESE ARE CRITICAL FOR ORDER MESSAGES ---
    @Column(columnDefinition = "TEXT") 
    private String message; // Stores: "Order Shipped"
    
    @Column(columnDefinition = "TEXT")
    private String content; // Stores: "Your order #123 is on the way..."
}
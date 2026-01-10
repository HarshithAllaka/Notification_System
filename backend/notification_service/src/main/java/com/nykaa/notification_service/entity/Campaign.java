package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "campaigns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campaignName;
    private String notificationType; // offers, order_updates, newsletter
    private String cityFilter;

    @Enumerated(EnumType.STRING)
    private CampaignStatus status = CampaignStatus.DRAFT;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Staff createdBy;
}
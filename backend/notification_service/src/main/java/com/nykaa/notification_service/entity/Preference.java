package com.nykaa.notification_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "preferences")
@Data
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Legacy fields for backward compatibility (map to granular)
    private boolean newsletter;
    private boolean offers;
    private boolean orderUpdates;

    // Promotion Offers preferences
    private boolean emailOffers;
    private boolean smsOffers;
    private boolean pushOffers;

    // Newsletters preferences
    private boolean emailNewsletters;
    private boolean smsNewsletters;
    private boolean pushNewsletters;

    // Order Updates preferences
    private boolean emailOrders;
    private boolean smsOrders;
    private boolean pushOrders;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore // Prevents Infinite Loop
    private User user;
}
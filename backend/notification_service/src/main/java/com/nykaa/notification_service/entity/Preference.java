package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Preference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private boolean offers = false;
    private boolean orderUpdates = false;
    private boolean newsletter = false;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
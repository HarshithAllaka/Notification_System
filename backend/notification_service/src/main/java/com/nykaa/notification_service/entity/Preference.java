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

    private boolean offers;
    private boolean newsletter;
    private boolean orderUpdates;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore // Prevents Infinite Loop
    private User user;
}
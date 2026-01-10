package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "staff_users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
}
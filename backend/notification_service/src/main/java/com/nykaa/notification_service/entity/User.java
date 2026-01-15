package com.nykaa.notification_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.opencsv.bean.CsvBindByName;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data // Generates getters, setters, required constructors
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true)
    @CsvBindByName(column = "user_id", required = false)
    private String userId;

    @CsvBindByName(column = "name", required = false)
    private String name;
    
    @Column(unique = true)
    @CsvBindByName(column = "email", required = false)
    private String email;
    
    @CsvBindByName(column = "phone", required = false)
    private String phone;
    
    @CsvBindByName(column = "city", required = false)
    private String city;
    
    @CsvBindByName(column = "is_active", required = false)
    private boolean isActive;

    // --- Backend Fields ---
    @CsvBindByName(column = "password", required = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Preference preference;
    
    @PrePersist
    public void prePersist() {
        if (this.role == null) {
            this.role = Role.USER;
        }
    }
}
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
    @Column(name = "user_id")
    @CsvBindByName(column = "user_id")
    private String userId;

    @CsvBindByName(column = "name")
    private String name;
    
    @Column(unique = true)
    @CsvBindByName(column = "email")
    private String email;
    
    @CsvBindByName(column = "phone")
    private String phone;
    
    @CsvBindByName(column = "city")
    private String city;
    
    @CsvBindByName(column = "is_active")
    private boolean isActive;

    // --- Backend Fields ---
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore // Prevents Infinite Loop
    private Preference preference;
    
    @PrePersist
    public void prePersist() {
        if (this.role == null) {
            this.role = Role.USER;
        }
    }
}
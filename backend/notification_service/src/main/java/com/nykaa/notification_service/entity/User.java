package com.nykaa.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;
import com.opencsv.bean.CsvBindByName;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @CsvBindByName(column = "user_id")
    private String userId;
    @CsvBindByName(column = "name")
    private String name;
    @CsvBindByName(column = "email")
    private String email;
    @CsvBindByName(column = "phone")
    private String phone;
    @CsvBindByName(column = "city")
    private String city;
    @CsvBindByName(column = "is_active")
    private boolean isActive = true;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Preference preference;
}
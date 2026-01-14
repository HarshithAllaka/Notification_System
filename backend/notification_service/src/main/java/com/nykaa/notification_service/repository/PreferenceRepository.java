package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.Preference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreferenceRepository extends JpaRepository<Preference, Long> {
    // This finds the Preference record where the linked User has the specific userId string
    Preference findByUserUserId(String userId);
}
package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.Preference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PreferenceRepository extends JpaRepository<Preference, Long> {
    // This custom method finds preferences by the *User's ID* (which is a String)
    Preference findByUserUserId(String userId); 
}
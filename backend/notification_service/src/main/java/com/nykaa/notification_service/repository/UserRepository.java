package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List; // Import List

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(String userId);
    
    // --- ADD THESE TWO METHODS ---
    List<User> findByCity(String city);
    List<User> findByCityIn(List<String> cities);
}
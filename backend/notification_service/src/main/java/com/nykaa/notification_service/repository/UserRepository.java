package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email); // <--- Added for Login
    boolean existsByEmail(String email);      // <--- Added for Signup check
}
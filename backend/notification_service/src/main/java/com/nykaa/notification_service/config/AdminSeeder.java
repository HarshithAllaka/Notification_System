package com.nykaa.notification_service.config;

import com.nykaa.notification_service.entity.Role;
import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@nykaa.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@nykaa.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setName("Admin");
            admin.setUserId("admin-uuid");
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println("Default Admin account created: admin@nykaa.com / admin123");
        } else {
            // FORCE RESET PASSWORD for recovery
            User admin = userRepository.findByEmail("admin@nykaa.com").get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            System.out.println("Admin password reset to default: admin@nykaa.com / admin123");
        }
    }
}
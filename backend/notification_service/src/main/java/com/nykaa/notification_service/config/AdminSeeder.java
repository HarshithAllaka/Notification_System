package com.nykaa.notification_service.config;

import com.nykaa.notification_service.entity.Role;
import com.nykaa.notification_service.entity.Staff;
import com.nykaa.notification_service.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (staffRepository.count() == 0) {
            Staff admin = new Staff();
            admin.setEmail("admin@nykaa.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            staffRepository.save(admin);
            System.out.println("Default Admin account created: admin@nykaa.com / admin123");
        }
    }
}
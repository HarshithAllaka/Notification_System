package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.entity.Staff;
import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.repository.StaffRepository;
import com.nykaa.notification_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    // Helper to get current logged-in user's email from the security token
    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    // Get my profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        String email = getCurrentUserEmail();

        // Check if Staff
        Optional<Staff> staff = staffRepository.findByEmail(email);
        if (staff.isPresent()) {
            return ResponseEntity.ok(staff.get());
        }

        // Check if User
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }

        return ResponseEntity.notFound().build();
    }

    // Update my profile
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody ProfileUpdateRequest request) {
        String email = getCurrentUserEmail();

        // Check if Staff
        Optional<Staff> staffOpt = staffRepository.findByEmail(email);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            if (request.getName() != null) staff.setName(request.getName());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
                    return ResponseEntity.badRequest().body("Old password is required to change password");
                }
                if (!passwordEncoder.matches(request.getOldPassword(), staff.getPassword())) {
                    return ResponseEntity.badRequest().body("Old password is incorrect");
                }
                staff.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            staffRepository.save(staff);
            return ResponseEntity.ok(staff);
        }

        // Check if User
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.getName() != null) user.setName(request.getName());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getCity() != null) user.setCity(request.getCity());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
                    return ResponseEntity.badRequest().body("Old password is required to change password");
                }
                if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                    return ResponseEntity.badRequest().body("Old password is incorrect");
                }
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }

        return ResponseEntity.notFound().build();
    }

    // DTO for update request
    public static class ProfileUpdateRequest {
        private String name;
        private String phone;
        private String city;
        private String password;
        private String oldPassword;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
    }
}
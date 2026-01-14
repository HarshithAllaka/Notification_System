package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.entity.Preference;
import com.nykaa.notification_service.repository.UserRepository;
import com.nykaa.notification_service.repository.PreferenceRepository;
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
    private final PreferenceRepository preferenceRepository;
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

        // Check if User (includes staff)
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

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // 1. Update User Details
            if (request.getName() != null) user.setName(request.getName());
            if (user.getRole() == com.nykaa.notification_service.entity.Role.USER) {
                if (request.getPhone() != null) user.setPhone(request.getPhone());
                if (request.getCity() != null) user.setCity(request.getCity());
            }
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
                    return ResponseEntity.badRequest().body("Old password is required to change password");
                }
                if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                    return ResponseEntity.badRequest().body("Old password is incorrect");
                }
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            // 2. Update Preferences (Attached to User)
            Preference pref = user.getPreference();
            if (pref == null) {
                // Fallback for legacy users without preferences
                pref = new Preference();
                pref.setUser(user);
                user.setPreference(pref);
            }

            // Set granular fields
            pref.setEmailOffers(request.isEmailOffers());
            pref.setSmsOffers(request.isSmsOffers());
            pref.setPushOffers(request.isPushOffers());
            
            pref.setEmailNewsletters(request.isEmailNewsletters());
            pref.setSmsNewsletters(request.isSmsNewsletters());
            pref.setPushNewsletters(request.isPushNewsletters());
            
            pref.setEmailOrders(request.isEmailOrders());
            pref.setSmsOrders(request.isSmsOrders());
            pref.setPushOrders(request.isPushOrders());

            // SYNC MASTER SWITCHES (Logic from UserController)
            pref.setOffers(pref.isEmailOffers() || pref.isSmsOffers() || pref.isPushOffers());
            pref.setNewsletter(pref.isEmailNewsletters() || pref.isSmsNewsletters() || pref.isPushNewsletters());
            pref.setOrderUpdates(pref.isEmailOrders() || pref.isSmsOrders() || pref.isPushOrders());

            // 3. Save User (Cascades to Preference)
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
        // Preferences
        private boolean emailOffers;
        private boolean smsOffers;
        private boolean pushOffers;
        private boolean emailNewsletters;
        private boolean smsNewsletters;
        private boolean pushNewsletters;
        private boolean emailOrders;
        private boolean smsOrders;
        private boolean pushOrders;

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
        public boolean isEmailOffers() { return emailOffers; }
        public void setEmailOffers(boolean emailOffers) { this.emailOffers = emailOffers; }
        public boolean isSmsOffers() { return smsOffers; }
        public void setSmsOffers(boolean smsOffers) { this.smsOffers = smsOffers; }
        public boolean isPushOffers() { return pushOffers; }
        public void setPushOffers(boolean pushOffers) { this.pushOffers = pushOffers; }
        public boolean isEmailNewsletters() { return emailNewsletters; }
        public void setEmailNewsletters(boolean emailNewsletters) { this.emailNewsletters = emailNewsletters; }
        public boolean isSmsNewsletters() { return smsNewsletters; }
        public void setSmsNewsletters(boolean smsNewsletters) { this.smsNewsletters = smsNewsletters; }
        public boolean isPushNewsletters() { return pushNewsletters; }
        public void setPushNewsletters(boolean pushNewsletters) { this.pushNewsletters = pushNewsletters; }
        public boolean isEmailOrders() { return emailOrders; }
        public void setEmailOrders(boolean emailOrders) { this.emailOrders = emailOrders; }
        public boolean isSmsOrders() { return smsOrders; }
        public void setSmsOrders(boolean smsOrders) { this.smsOrders = smsOrders; }
        public boolean isPushOrders() { return pushOrders; }
        public void setPushOrders(boolean pushOrders) { this.pushOrders = pushOrders; }
    }
}
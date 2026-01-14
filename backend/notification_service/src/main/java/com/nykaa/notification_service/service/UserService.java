package com.nykaa.notification_service.service;

import com.nykaa.notification_service.entity.Preference;
import com.nykaa.notification_service.entity.Role;
import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.repository.PreferenceRepository;
import com.nykaa.notification_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final PasswordEncoder passwordEncoder;

    // --- 1. Register User (Public Sign Up) ---
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        User savedUser = userRepository.save(user);

        createDefaultPreferences(savedUser); 
        return savedUser;
    }

    // --- 2. Create User Manually (Admin Dashboard) ---
    public User createUserManually(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        if (user.getRole() == null) user.setRole(Role.USER);
        if (user.getUserId() == null) user.setUserId(UUID.randomUUID().toString());
        user.setActive(true); 
        
        User savedUser = userRepository.save(user);

        createDefaultPreferences(savedUser);
        return savedUser;
    }

    // --- Helper: Set Defaults Correctly ---
    private void createDefaultPreferences(User user) {
        Preference pref = new Preference();
        pref.setUser(user);
        
        // --- FIX: Turn ON Master Switches by default ---
        pref.setOffers(true);
        pref.setNewsletter(true);
        pref.setOrderUpdates(true);

        // --- Turn ON Granular Switches by default ---
        pref.setEmailOffers(true);
        pref.setSmsOffers(true);
        pref.setPushOffers(true);
        
        pref.setEmailNewsletters(true);
        pref.setSmsNewsletters(true);
        pref.setPushNewsletters(true);
        
        pref.setEmailOrders(true);
        pref.setSmsOrders(true);
        pref.setPushOrders(true);
        
        preferenceRepository.save(pref);
    }

    // --- 3. Get User Profile ---
    public User getUserProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- 4. Update Preferences (Restored from your code) ---
    public User updatePreferences(String email, Preference updatedPref) {
        User user = getUserProfile(email);
        Preference pref = user.getPreference();
        
        if (pref == null) { 
            pref = new Preference();
            pref.setUser(user);
        }

        pref.setOffers(updatedPref.isOffers());
        pref.setNewsletter(updatedPref.isNewsletter());
        pref.setOrderUpdates(updatedPref.isOrderUpdates());
        preferenceRepository.save(pref);
        return user;
    }

    // --- ADMIN METHODS ---

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(String userId, User updatedData) {
        User existing = userRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        existing.setName(updatedData.getName());
        existing.setEmail(updatedData.getEmail());
        existing.setPhone(updatedData.getPhone());
        existing.setCity(updatedData.getCity());
        
        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(updatedData.getPassword()));
        }
        return userRepository.save(existing);
    }

    public void deleteUser(String userId) {
        User user = userRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public String toggleUserActiveStatus(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setActive(!user.isActive());
        userRepository.save(user);
        
        return user.isActive() ? "User Activated" : "User Deactivated";
    }
}
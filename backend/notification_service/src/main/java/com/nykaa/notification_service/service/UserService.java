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

    // --- EXISTING METHODS (Keep these) ---
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        User savedUser = userRepository.save(user);

        // Create Default Preferences
        Preference pref = new Preference();
        pref.setUser(savedUser);
        pref.setOffers(true);
        pref.setNewsletter(true);
        pref.setOrderUpdates(true);
        preferenceRepository.save(pref);

        return savedUser;
    }

    public User getUserProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updatePreferences(String email, Preference updatedPref) {
        User user = getUserProfile(email);
        Preference pref = user.getPreference();
        pref.setOffers(updatedPref.isOffers());
        pref.setNewsletter(updatedPref.isNewsletter());
        pref.setOrderUpdates(updatedPref.isOrderUpdates());
        preferenceRepository.save(pref);
        return user;
    }

    // --- NEW ADMIN METHODS ---

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUserManually(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole(Role.USER);
        if (user.getUserId() == null) user.setUserId(UUID.randomUUID().toString());
        
        // Save User
        User savedUser = userRepository.save(user);

        // Create Preferences for them immediately
        Preference pref = new Preference();
        pref.setUser(savedUser);
        pref.setOffers(true);
        pref.setNewsletter(true);
        pref.setOrderUpdates(true);
        preferenceRepository.save(pref);

        return savedUser;
    }

    public User updateUser(String userId, User updatedData) {
        User existing = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        existing.setName(updatedData.getName());
        existing.setEmail(updatedData.getEmail());
        existing.setPhone(updatedData.getPhone());
        existing.setCity(updatedData.getCity());
        
        // Only update password if a new one is provided
        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(updatedData.getPassword()));
        }
        return userRepository.save(existing);
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }
}
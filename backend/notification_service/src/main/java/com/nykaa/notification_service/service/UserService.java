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

    // --- CSV UPLOAD (ROBUST) ---
    public void uploadUsersFromCsv(org.springframework.web.multipart.MultipartFile file) {
        try (java.io.Reader reader = new java.io.InputStreamReader(file.getInputStream())) {
            com.opencsv.CSVReader csvReader = new com.opencsv.CSVReader(reader);
            List<String[]> rows = csvReader.readAll();
            
            if (rows.isEmpty()) throw new RuntimeException("Empty CSV file");

            String[] headers = rows.get(0);
            rows.remove(0); // Remove header row

            // Map Header Names to Indices
            int emailIdx = -1, phoneIdx = -1, nameIdx = -1, cityIdx = -1, activeIdx = -1, userIdIdx = -1, passwordIdx = -1;
            
            for (int i = 0; i < headers.length; i++) {
                String h = headers[i].trim().toLowerCase().replace("_", ""); // Normalize: user_id -> userid
                if (h.equals("email")) emailIdx = i;
                else if (h.contains("phone")) phoneIdx = i;
                else if (h.equals("name")) nameIdx = i;
                else if (h.equals("city")) cityIdx = i;
                else if (h.contains("active")) activeIdx = i;
                else if (h.contains("userid")) userIdIdx = i;
                else if (h.contains("pass")) passwordIdx = i;
            }

            if (emailIdx == -1) throw new RuntimeException("Missing required column: email");

            for (String[] row : rows) {
                try {
                    // unexpected empty row check
                    if (row.length <= emailIdx) continue;

                    User user = new User();
                    user.setEmail(row[emailIdx].trim());
                    
                    if (nameIdx != -1 && row.length > nameIdx) user.setName(row[nameIdx].trim());
                    if (cityIdx != -1 && row.length > cityIdx) user.setCity(row[cityIdx].trim());
                    
                    if (userIdIdx != -1 && row.length > userIdIdx) user.setUserId(row[userIdIdx].trim());
                    
                    // Handle Phone
                    if (phoneIdx != -1 && row.length > phoneIdx) {
                        String rawPhone = row[phoneIdx].trim();
                        if (rawPhone.contains("E")) {
                             try {
                                 java.math.BigDecimal bd = new java.math.BigDecimal(rawPhone);
                                 user.setPhone(bd.toPlainString());
                             } catch (Exception ignored) { user.setPhone(rawPhone); }
                        } else {
                            user.setPhone(rawPhone);
                        }
                    }

                    // Handle Active
                    if (activeIdx != -1 && row.length > activeIdx) {
                        String activeStr = row[activeIdx].trim().toLowerCase();
                        user.setActive(activeStr.equals("true") || activeStr.equals("1") || activeStr.equals("yes"));
                    } else {
                        user.setActive(true); // Default
                    }

                    // Handle Password
                    if (passwordIdx != -1 && row.length > passwordIdx && !row[passwordIdx].trim().isEmpty()) {
                        user.setPassword(row[passwordIdx].trim());
                    } else {
                        user.setPassword("Nykaa@123");
                    }

                    createUserManually(user);
                } catch (Exception e) {
                    System.err.println("Skipping row due to error: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("CSV Parsing Error: " + e.getMessage());
        }
    }
}
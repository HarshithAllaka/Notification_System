package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.dto.LoginRequest;
import com.nykaa.notification_service.dto.RegisterRequest;
import com.nykaa.notification_service.entity.Staff;
import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.repository.StaffRepository;
import com.nykaa.notification_service.service.UserService;
import com.nykaa.notification_service.config.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserService userService;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            logger.info("Authentication successful for email: {}", request.getEmail());

            // 1. Check if Staff (Admin/Creator/Viewer)
            Optional<Staff> staff = staffRepository.findByEmail(request.getEmail());
            if (staff.isPresent()) {
                String token = jwtService.generateToken(staff.get().getEmail(), staff.get().getRole().name());
                logger.info("Staff login successful: {} with role {}", staff.get().getEmail(), staff.get().getRole());
                // Staff don't use City/ID features in dashboard, so we send default values
                return ResponseEntity.ok(new AuthResponse(
                    token, 
                    staff.get().getRole().name(), 
                    staff.get().getName(), 
                    String.valueOf(staff.get().getId()), 
                    staff.get().getEmail(), 
                    "N/A"
                ));
            }

            // 2. Check if User (Customer)
            User user = userService.getUserProfile(request.getEmail());
            String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
            logger.info("User login successful: {} with role {}", user.getEmail(), user.getRole());
            
            // --- THIS WAS THE MISSING PART ---
            // We now send the ID and CITY so the frontend can find notifications
            return ResponseEntity.ok(new AuthResponse(
                token, 
                user.getRole().name(), 
                user.getName(), 
                user.getUserId(), // <--- CRITICAL FIX
                user.getEmail(), 
                user.getCity()    // <--- CRITICAL FIX
            ));
        } catch (Exception e) {
            logger.warn("Login failed for email: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); 
        user.setPhone(request.getPhone());
        user.setCity(request.getCity()); 
        user.setActive(true);
        
        userService.registerUser(user); 

        return ResponseEntity.ok("User registered successfully");
    }

    // --- UPDATED RESPONSE DTO ---
    static class AuthResponse {
        private String token;
        private String role;
        private String name;
        private String id;
        private String email;
        private String city;

        // Constructors
        public AuthResponse() {}

        public AuthResponse(String token, String role, String name, String id, String email, String city) {
            this.token = token;
            this.role = role;
            this.name = name;
            this.id = id;
            this.email = email;
            this.city = city;
        }

        // Getters and Setters
        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }
    }
}
package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.dto.LoginRequest;
import com.nykaa.notification_service.dto.RegisterRequest;
import com.nykaa.notification_service.entity.Staff;
import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.repository.StaffRepository;
import com.nykaa.notification_service.service.UserService;
import com.nykaa.notification_service.config.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final StaffRepository staffRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 1. Check if Staff (Admin/Creator/Viewer)
        Optional<Staff> staff = staffRepository.findByEmail(request.getEmail());
        if (staff.isPresent()) {
            String token = jwtService.generateToken(staff.get().getEmail(), staff.get().getRole().name());
            return ResponseEntity.ok(new AuthResponse(token, staff.get().getRole().name(), staff.get().getName()));
        }

        // 2. Check if User (Customer)
        User user = userService.getUserProfile(request.getEmail());
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Service will encode this
        user.setPhone(request.getPhone());
        user.setCity(request.getCity());
        user.setActive(true);
        
        // --- FIX: Method name changed from 'createUser' to 'registerUser' ---
        userService.registerUser(user); 

        return ResponseEntity.ok("User registered successfully");
    }

    // Response DTO
    @Data
    @AllArgsConstructor
    static class AuthResponse {
        private String token;
        private String role;
        private String name;
    }
}
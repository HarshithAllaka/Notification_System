package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.dto.LoginRequest; // Must match exactly
import com.nykaa.notification_service.entity.Staff;
import com.nykaa.notification_service.repository.StaffRepository;
import com.nykaa.notification_service.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final StaffRepository staffRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Staff staff = staffRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", staff.getRole().name());

        String token = jwtService.generateToken(staff.getEmail(), extraClaims);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", staff.getRole().name());
        
        return ResponseEntity.ok(response);
    }
}
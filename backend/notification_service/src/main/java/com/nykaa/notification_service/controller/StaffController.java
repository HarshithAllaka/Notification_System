package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.dto.CreateStaffRequest;
import com.nykaa.notification_service.entity.Staff;
import com.nykaa.notification_service.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class StaffController {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/create-staff")
    public ResponseEntity<String> createStaff(@RequestBody CreateStaffRequest request) {
        if (staffRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use!");
        }
        Staff newStaff = new Staff();
        newStaff.setName(request.getName());
        newStaff.setEmail(request.getEmail());
        newStaff.setPassword(passwordEncoder.encode(request.getPassword()));
        newStaff.setRole(request.getRole());

        staffRepository.save(newStaff);
        return ResponseEntity.ok("Staff member created successfully!");
    }

    // --- NEW ENDPOINTS ---

    @GetMapping("/all")
    public ResponseEntity<List<Staff>> getAllStaff() {
        return ResponseEntity.ok(staffRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStaff(@PathVariable Long id) {
        staffRepository.deleteById(id);
        return ResponseEntity.ok("Staff deleted");
    }
}
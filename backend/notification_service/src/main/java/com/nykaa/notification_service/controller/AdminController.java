package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.repository.UserRepository;
import com.nykaa.notification_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin") // Matches frontend calls like /api/admin/users/...
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // --- USER MANAGEMENT ENDPOINTS ---

    @GetMapping("/users/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (user.getEmail() == null || userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists or is invalid");
        }
        if (user.getPhone() != null && !user.getPhone().matches("\\d{10}")) {
            return ResponseEntity.badRequest().body("Phone number must be exactly 10 digits");
        }
        return ResponseEntity.ok(userService.createUserManually(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PostMapping("/users/upload-csv")
    public ResponseEntity<String> uploadUsers(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        System.out.println("DEBUG: Entering uploadUsers endpoint");
        if (file.isEmpty()) {
            System.out.println("DEBUG: File is empty");
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            System.out.println("DEBUG: Calling service uploadUsersFromCsv");
            userService.uploadUsersFromCsv(file);
            System.out.println("DEBUG: Upload success");
            return ResponseEntity.ok("Users uploaded successfully");
        } catch (Exception e) {
            System.out.println("DEBUG: ERROR in upload: " + e.getMessage());
            e.printStackTrace(); // Log to console
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // --- NEW: Toggle Status Endpoint ---
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable String id) {
        return ResponseEntity.ok(userService.toggleUserActiveStatus(id));
    }


    // --- STAFF MANAGEMENT ENDPOINTS ---

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllStaff() {
        List<User> staff = userService.getAllUsers().stream()
            .filter(u -> u.getRole() != com.nykaa.notification_service.entity.Role.USER)
            .collect(Collectors.toList());
        return ResponseEntity.ok(staff);
    }

    @PostMapping("/create-staff")
    public ResponseEntity<?> createStaff(@RequestBody User staff) {
        if (userRepository.findByEmail(staff.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        // Set defaults for staff
        staff.setUserId(java.util.UUID.randomUUID().toString());
        staff.setActive(true);
        staff.setPhone(null);
        staff.setCity(null);
        userService.createUserManually(staff);
        return ResponseEntity.ok("Staff member created");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStaff(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(userRepository::delete);
        return ResponseEntity.ok("Staff removed");
    }
}
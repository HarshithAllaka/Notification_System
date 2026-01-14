package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.entity.*;
import com.nykaa.notification_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final NotificationLogRepository logRepository;

    // --- PRODUCTS (Store Manager) ---

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PostMapping("/products")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productRepository.save(product));
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    // --- ORDERS (Order Management) ---

    @GetMapping("/orders/all")
    public ResponseEntity<List<Orders>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    // USER: Place an Order
    @PostMapping("/order/{productId}")
    public ResponseEntity<?> placeOrder(@PathVariable Long productId) {
        try {
            // 1. Get Logged-in User
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

            // 2. Save Order to DB
            Orders order = new Orders();
            order.setUserId(user.getUserId());
            order.setUserName(user.getName());
            order.setProductName(product.getName());
            order.setAmount(product.getPrice());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            // 3. Trigger "Order Placed" Notification
            safeSendNotification(user.getUserId(), "Order Placed: " + product.getName());

            return ResponseEntity.ok("Order Placed Successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error placing order: " + e.getMessage());
        }
    }
    
    // ADMIN: Update Status (This was crashing before)
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            // 1. Find and Update Order
            Orders order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            order.setStatus(status);
            orderRepository.save(order);

            // 2. Trigger "Status Update" Notification
            // This runs safely. Even if it fails (e.g. user has no preferences), the Order Status still updates.
            safeSendNotification(order.getUserId(), "Order Update: Your order is now " + status);

            return ResponseEntity.ok("Status Updated");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating status: " + e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Orders>> getMyOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByUserId(user.getUserId()));
    }

    // --- HELPER: Safe Notification Logic ---
    private void safeSendNotification(String userId, String message) {
        try {
            // Check if user has preferences set
            Preference pref = preferenceRepository.findByUserUserId(userId);
            
            // If user has NO preferences record, we can't check 'isOrderUpdates'. 
            // You might want to default to sending it, or just skip. 
            // Here we skip if null to prevent crash.
            if (pref != null && pref.isOrderUpdates()) {
                if (pref.isEmailOrders()) createLog(userId, "EMAIL", message);
                if (pref.isSmsOrders()) createLog(userId, "SMS", message);
                if (pref.isPushOrders()) createLog(userId, "PUSH", message);
            }
        } catch (Exception e) {
            // Log the error but DO NOT throw it back to the main method
            System.err.println("Notification failed for user " + userId + ": " + e.getMessage());
        }
    }

    private void createLog(String userId, String channel, String message) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setChannel(channel);
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        // Use a dummy ID or '0' for transactional messages that aren't part of a mass campaign
        log.setCampaignId(0L); 
        // Note: You might want to save the 'message' content in NotificationLog if your entity supports it.
        // Currently NotificationLog doesn't have a 'content' field in your previous upload, 
        // so the frontend will just see the Campaign Name logic. 
        // For now, this just logs that a message WAS sent.
        logRepository.save(log);
    }
}
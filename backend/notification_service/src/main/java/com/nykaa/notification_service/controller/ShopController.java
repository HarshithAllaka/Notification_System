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

    // --- PRODUCTS ---

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

    // --- ORDERS ---

    @GetMapping("/orders/all")
    public ResponseEntity<List<Orders>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PostMapping("/order/{productId}")
    public ResponseEntity<?> placeOrder(@PathVariable Long productId) {
        try {
            // 1. Get User
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

            // 2. Save Order
            Orders order = new Orders();
            order.setUserId(user.getUserId());
            order.setUserName(user.getName());
            order.setProductName(product.getName());
            order.setAmount(product.getPrice());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            // 3. Trigger Notification (Safely)
            safeSendNotification(user.getUserId(), "Order Confirmed: " + product.getName());

            return ResponseEntity.ok("Order Placed Successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error placing order: " + e.getMessage());
        }
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            // 1. Update Order
            Orders order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            order.setStatus(status);
            orderRepository.save(order);

            // 2. Trigger Notification (Safely)
            safeSendNotification(order.getUserId(), "Order Update: Your order is " + status);

            return ResponseEntity.ok("Status Updated");
        } catch (Exception e) {
            e.printStackTrace(); // Check your console for this error!
            return ResponseEntity.status(500).body("Error updating status: " + e.getMessage());
        }
    }

    // --- HELPERS ---
    
    // Wraps notification logic so it never crashes the main request
    private void safeSendNotification(String userId, String message) {
        try {
            Preference pref = preferenceRepository.findByUserUserId(userId);
            if (pref != null && pref.isOrderUpdates()) {
                if (pref.isEmailOrders()) createLog(userId, "EMAIL", message);
                if (pref.isSmsOrders()) createLog(userId, "SMS", message);
                if (pref.isPushOrders()) createLog(userId, "PUSH", message);
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
            // We swallow the error here so the Order update doesn't fail
        }
    }

    private void createLog(String userId, String channel, String message) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setChannel(channel);
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        log.setCampaignId(0L); // 0 indicates Transactional/Order message
        logRepository.save(log);
    }
    
    @GetMapping("/my-orders")
    public ResponseEntity<List<Orders>> getMyOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByUserId(user.getUserId()));
    }
}
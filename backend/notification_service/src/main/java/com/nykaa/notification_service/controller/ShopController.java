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
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

            Orders order = new Orders();
            order.setUserId(user.getUserId());
            order.setUserName(user.getName());
            order.setProductName(product.getName());
            order.setAmount(product.getPrice());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            // Trigger Notification
            System.out.println("TRIGGERING ORDER PLACED NOTIFICATION FOR: " + user.getName());
            safeSendNotification(user.getUserId(), "Order Placed", "Your order for " + product.getName() + " has been placed successfully.");

            return ResponseEntity.ok("Order Placed Successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Orders order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            order.setStatus(status);
            orderRepository.save(order);

            // Trigger Notification
            System.out.println("TRIGGERING STATUS UPDATE (" + status + ") FOR USER ID: " + order.getUserId());
            String subject = "Order Status: " + status;
            String body = "Your order for " + order.getProductName() + " is now " + status + ".";
            
            safeSendNotification(order.getUserId(), subject, body);

            return ResponseEntity.ok("Status Updated");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Orders>> getMyOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByUserId(user.getUserId()));
    }

    // --- HELPER: ROBUST NOTIFICATION LOGIC ---
    private void safeSendNotification(String userId, String subject, String body) {
        try {
            Preference pref = preferenceRepository.findByUserUserId(userId);
            
            boolean sendEmail = true;
            boolean sendSms = true;
            boolean sendPush = true;

            // If preferences exist, respect them. If NULL, default to TRUE so the user still gets it.
            if (pref != null) {
                // If "Order Updates" is disabled globally, don't send anything
                if (!pref.isOrderUpdates()) {
                    System.out.println("User has disabled Order Updates. Skipping.");
                    return;
                }
                sendEmail = pref.isEmailOrders();
                sendSms = pref.isSmsOrders();
                sendPush = pref.isPushOrders();
            } else {
                System.out.println("Preferences not found for user. Defaulting to SEND ALL.");
            }

            if (sendEmail) createLog(userId, "EMAIL", subject, body);
            if (sendSms) createLog(userId, "SMS", subject, body);
            if (sendPush) createLog(userId, "PUSH", subject, body);

        } catch (Exception e) {
            System.err.println("Notification Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createLog(String userId, String channel, String subject, String body) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setChannel(channel);
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        log.setCampaignId(0L); // 0 = Transactional
        
        // SAVE THE TEXT
        log.setMessage(subject);
        log.setContent(body);
        
        logRepository.save(log);
        System.out.println("LOG SAVED: " + subject + " via " + channel);
    }
}
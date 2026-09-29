package com.scrollshop.controller;

import com.scrollshop.dto.PaymentDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final RazorpayService razorpayService;
    private final AuthService authService;

    @PostMapping("/create-order/{orderId}")
    public ResponseEntity<RazorpayOrderResponse> initiatePayment(@PathVariable Long orderId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(razorpayService.initiatePayment(orderId, currentUser));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerifyResponse> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(razorpayService.verifyPayment(request, currentUser));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        razorpayService.processWebhookEvent(rawPayload, signature);
        return ResponseEntity.ok("Webhook processed successfully");
    }
}

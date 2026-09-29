package com.scrollshop.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class RazorpayConfig {

    @Value("${app.razorpay.key-id:rzp_test_YourKeyIdHere}")
    private String keyId;

    @Value("${app.razorpay.key-secret:YourRazorpaySecretHere}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            if (keyId != null && !keyId.contains("YourKeyIdHere") && !keyId.isBlank() &&
                keySecret != null && !keySecret.contains("YourRazorpaySecretHere") && !keySecret.isBlank()) {
                return new RazorpayClient(keyId, keySecret);
            }
            log.info("Razorpay credentials in default test placeholder mode. Using fallback simulation.");
            return new RazorpayClient("rzp_test_placeholder", "secret_placeholder");
        } catch (Exception e) {
            log.warn("Razorpay client initialized in local mock fallback mode.");
            return null;
        }
    }
}


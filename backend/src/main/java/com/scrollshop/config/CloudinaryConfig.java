package com.scrollshop.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class CloudinaryConfig {

    @Value("${app.cloudinary.cloud-name}")
    private String cloudName;

    @Value("${app.cloudinary.api-key}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudName != null && !cloudName.equals("demo") && apiKey != null && !apiKey.equals("demo_key")) {
            return new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        }
        log.info("Cloudinary using standard direct URL references / fallback mode.");
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "demo",
                "api_key", "123456789012345",
                "api_secret", "abcdefghijklmnopqrstuvwxyz12",
                "secure", true
        ));
    }
}

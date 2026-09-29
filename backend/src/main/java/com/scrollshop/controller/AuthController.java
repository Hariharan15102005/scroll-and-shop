package com.scrollshop.controller;

import com.scrollshop.dto.AuthDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<java.util.Map<String, String>> logout() {
        return ResponseEntity.ok(java.util.Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(authService.getProfile(currentUser.getId(), currentUser.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(authService.updateProfile(currentUser.getId(), request));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId) {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(authService.getProfile(currentUserId, userId));
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<UserProfileDto>> searchUsers(@RequestParam String query) {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(authService.searchUsers(currentUserId, query));
    }
}

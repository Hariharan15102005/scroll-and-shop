package com.scrollshop.controller;

import com.scrollshop.dto.AuthDtos.UpdateProfileRequest;
import com.scrollshop.dto.AuthDtos.UserProfileDto;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.SocialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;
    private final SocialService socialService;

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDto>> searchUsers(@RequestParam String query) {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(authService.searchUsers(currentUserId, query));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(authService.updateProfile(currentUser.getId(), request));
    }

    @GetMapping("/{usernameOrId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable String usernameOrId) {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;

        try {
            Long userId = Long.parseLong(usernameOrId);
            return ResponseEntity.ok(authService.getProfile(currentUserId, userId));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(authService.getProfileByUsername(currentUserId, usernameOrId));
        }
    }

    @PostMapping("/{userId}/block")
    public ResponseEntity<Void> blockUser(@PathVariable Long userId) {
        User currentUser = authService.getCurrentUser();
        socialService.blockUser(currentUser, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/block")
    public ResponseEntity<Void> unblockUser(@PathVariable Long userId) {
        User currentUser = authService.getCurrentUser();
        socialService.unblockUser(currentUser, userId);
        return ResponseEntity.ok().build();
    }
}

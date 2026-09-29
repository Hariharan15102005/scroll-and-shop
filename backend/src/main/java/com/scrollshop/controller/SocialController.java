package com.scrollshop.controller;

import com.scrollshop.dto.SocialDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.SocialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;
    private final AuthService authService;

    @GetMapping("/friends")
    public ResponseEntity<List<FriendDto>> getFriends() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.getFriends(currentUser.getId()));
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendRequestDto>> getPendingRequests() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.getPendingRequests(currentUser.getId()));
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendRequestDto>> getSentRequests() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.getOutgoingRequests(currentUser.getId()));
    }

    @GetMapping("/suggested")
    public ResponseEntity<List<FriendDto>> getSuggestedFriends() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.getSuggestedFriends(currentUser.getId()));
    }

    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<Void> cancelFriendRequest(@PathVariable Long requestId) {
        User currentUser = authService.getCurrentUser();
        socialService.cancelFriendRequest(currentUser, requestId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/requests")
    public ResponseEntity<FriendRequestDto> sendFriendRequest(@Valid @RequestBody SendFriendRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.sendFriendRequest(currentUser, request.getTargetUserId()));
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<FriendRequestDto> acceptFriendRequest(@PathVariable Long requestId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.acceptFriendRequest(currentUser, requestId));
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<FriendRequestDto> rejectFriendRequest(@PathVariable Long requestId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.rejectFriendRequest(currentUser, requestId));
    }

    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long friendId) {
        User currentUser = authService.getCurrentUser();
        socialService.removeFriend(currentUser, friendId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/block/{targetUserId}")
    public ResponseEntity<Void> blockUser(@PathVariable Long targetUserId) {
        User currentUser = authService.getCurrentUser();
        socialService.blockUser(currentUser, targetUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unblock/{targetUserId}")
    public ResponseEntity<Void> unblockUser(@PathVariable Long targetUserId) {
        User currentUser = authService.getCurrentUser();
        socialService.unblockUser(currentUser, targetUserId);
        return ResponseEntity.ok().build();
    }
}

package com.scrollshop.controller;

import com.scrollshop.dto.SocialDtos.FriendDto;
import com.scrollshop.dto.SocialDtos.FriendRequestDto;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendsController {

    private final SocialService socialService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<FriendDto>> getFriends() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.getFriends(currentUser.getId()));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long userId) {
        User currentUser = authService.getCurrentUser();
        socialService.removeFriend(currentUser, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/requests/{userId}")
    public ResponseEntity<FriendRequestDto> sendFriendRequest(@PathVariable Long userId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.sendFriendRequest(currentUser, userId));
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<List<FriendRequestDto>> getIncomingRequests() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.getPendingRequests(currentUser.getId()));
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<List<FriendRequestDto>> getOutgoingRequests() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialService.getOutgoingRequests(currentUser.getId()));
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

    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<Void> cancelFriendRequest(@PathVariable Long requestId) {
        User currentUser = authService.getCurrentUser();
        socialService.cancelFriendRequest(currentUser, requestId);
        return ResponseEntity.noContent().build();
    }
}

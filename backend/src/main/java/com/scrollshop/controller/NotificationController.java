package com.scrollshop.controller;

import com.scrollshop.dto.SocialDtos.NotificationDto;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(currentUser));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(currentUser)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long notificationId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, currentUser));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User currentUser = authService.getCurrentUser();
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        User currentUser = authService.getCurrentUser();
        notificationService.deleteNotification(notificationId, currentUser);
        return ResponseEntity.noContent().build();
    }
}

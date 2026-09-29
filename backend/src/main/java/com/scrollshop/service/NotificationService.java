package com.scrollshop.service;

import com.scrollshop.dto.SocialDtos.NotificationDto;
import com.scrollshop.entity.Notification;
import com.scrollshop.entity.NotificationType;
import com.scrollshop.entity.User;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<NotificationDto> getUserNotifications(User user) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toNotificationDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to notification");
        }

        notification.setIsRead(true);
        return toNotificationDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user.getId());
    }

    @Transactional
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public NotificationDto createAndSendNotification(
            User recipient,
            User sender,
            NotificationType type,
            String title,
            String message,
            String linkUrl) {

        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .title(title)
                .message(message)
                .linkUrl(linkUrl)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = toNotificationDto(saved);

        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + recipient.getId(), dto);
        } catch (Exception e) {
            log.warn("WebSocket notification broadcast notice: {}", e.getMessage());
        }

        return dto;
    }

    public NotificationDto toNotificationDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .recipientId(n.getRecipient().getId())
                .senderId(n.getSender() != null ? n.getSender().getId() : null)
                .senderUsername(n.getSender() != null ? n.getSender().getUsername() : null)
                .senderAvatar(n.getSender() != null ? n.getSender().getAvatarUrl() : null)
                .type(n.getType().name())
                .title(n.getTitle())
                .message(n.getMessage())
                .linkUrl(n.getLinkUrl())
                .isRead(Boolean.TRUE.equals(n.getIsRead()))
                .createdAt(n.getCreatedAt())
                .build();
    }
}

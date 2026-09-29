package com.scrollshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class SocialDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FriendRequestDto {
        private Long id;
        private Long senderId;
        private String senderUsername;
        private String senderFullName;
        private String senderAvatar;
        private Long receiverId;
        private String receiverUsername;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FriendDto {
        private Long id;
        private String username;
        private String fullName;
        private String avatarUrl;
        private String bio;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SendFriendRequest {
        @NotNull(message = "Target user ID is required")
        private Long targetUserId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CommentDto {
        private Long id;
        private Long productId;
        private Long userId;
        private String username;
        private String userAvatar;
        private String content;
        private Long parentCommentId;
        private List<CommentDto> replies;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateCommentRequest {
        @NotBlank(message = "Comment content cannot be empty")
        private String content;
        private Long parentCommentId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LikeResponse {
        private boolean liked;
        private long totalLikes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotificationDto {
        private Long id;
        private Long recipientId;
        private Long senderId;
        private String senderUsername;
        private String senderAvatar;
        private String type;
        private String title;
        private String message;
        private String linkUrl;
        private boolean isRead;
        private LocalDateTime createdAt;
    }
}

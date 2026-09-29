package com.scrollshop.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ChatDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParticipantDto {
        private Long id;
        private String username;
        private String fullName;
        private String avatarUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationDto {
        private Long id;
        private String title;
        private Boolean isGroup;
        private List<ParticipantDto> participants;
        private MessageDto lastMessage;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageDto {
        private Long id;
        private Long conversationId;
        private Long senderId;
        private String senderUsername;
        private String senderAvatar;
        private String content;
        private ProductDtos.ProductDto sharedProduct;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SendMessageRequest {
        private String content;
        private Long sharedProductId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateConversationRequest {
        @NotNull(message = "Recipient user ID is required")
        private Long recipientUserId;
    }
}

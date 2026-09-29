package com.scrollshop.controller;

import com.scrollshop.dto.ChatDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(chatService.getUserConversations(currentUser));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDto> startConversation(@Valid @RequestBody CreateConversationRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(chatService.getOrCreateDirectConversation(currentUser, request.getRecipientUserId()));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable Long conversationId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(chatService.getConversationMessages(conversationId, currentUser));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(chatService.sendMessage(conversationId, currentUser, request));
    }
}

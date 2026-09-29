package com.scrollshop.service;

import com.scrollshop.dto.ChatDtos.*;
import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.exception.UnauthorizedException;
import com.scrollshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ConversationDto> getUserConversations(User currentUser) {
        List<Conversation> conversations = conversationRepository.findConversationsForUser(currentUser.getId());
        return conversations.stream()
                .map(this::toConversationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDto getOrCreateDirectConversation(User currentUser, Long recipientId) {
        if (currentUser.getId().equals(recipientId)) {
            throw new BadRequestException("Cannot create conversation with yourself");
        }

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recipientId));

        Optional<Conversation> existing = conversationRepository.findDirectConversationBetween(currentUser.getId(), recipientId);
        if (existing.isPresent()) {
            return toConversationDto(existing.get());
        }

        Conversation conversation = Conversation.builder()
                .title(currentUser.getUsername() + " & " + recipient.getUsername())
                .isGroup(false)
                .build();

        Conversation saved = conversationRepository.save(conversation);

        ConversationParticipant p1 = ConversationParticipant.builder()
                .conversation(saved)
                .user(currentUser)
                .build();
        ConversationParticipant p2 = ConversationParticipant.builder()
                .conversation(saved)
                .user(recipient)
                .build();

        participantRepository.save(p1);
        participantRepository.save(p2);

        return toConversationDto(saved);
    }

    public List<MessageDto> getConversationMessages(Long conversationId, User currentUser) {
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, currentUser.getId())) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(Long conversationId, User sender, SendMessageRequest request) {
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, sender.getId())) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        Product sharedProduct = null;
        if (request.getSharedProductId() != null) {
            sharedProduct = productRepository.findById(request.getSharedProductId()).orElse(null);
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .sharedProduct(sharedProduct)
                .build();

        Message saved = messageRepository.save(message);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageDto messageDto = toMessageDto(saved);

        // Broadcast to WebSocket broker topic for active realtime chat subscribers
        try {
            messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, messageDto);
        } catch (Exception e) {
            log.warn("WebSocket broadcast notice: {}", e.getMessage());
        }

        return messageDto;
    }

    private ConversationDto toConversationDto(Conversation conv) {
        List<ParticipantDto> participants = participantRepository.findByConversationId(conv.getId()).stream()
                .map(p -> ParticipantDto.builder()
                        .id(p.getUser().getId())
                        .username(p.getUser().getUsername())
                        .fullName(p.getUser().getFullName())
                        .avatarUrl(p.getUser().getAvatarUrl())
                        .build())
                .collect(Collectors.toList());

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
        MessageDto lastMessage = messages.isEmpty() ? null : toMessageDto(messages.get(messages.size() - 1));

        return ConversationDto.builder()
                .id(conv.getId())
                .title(conv.getTitle())
                .isGroup(conv.getIsGroup())
                .participants(participants)
                .lastMessage(lastMessage)
                .updatedAt(conv.getUpdatedAt())
                .build();
    }

    private MessageDto toMessageDto(Message msg) {
        ProductDto productDto = null;
        if (msg.getSharedProduct() != null) {
            productDto = productService.toProductDto(msg.getSharedProduct(), null);
        }

        return MessageDto.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderId(msg.getSender().getId())
                .senderUsername(msg.getSender().getUsername())
                .senderAvatar(msg.getSender().getAvatarUrl())
                .content(msg.getContent())
                .sharedProduct(productDto)
                .createdAt(msg.getCreatedAt())
                .build();
    }
}

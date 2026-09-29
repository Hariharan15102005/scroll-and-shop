package com.scrollshop.service;

import com.scrollshop.dto.ChatDtos.MessageDto;
import com.scrollshop.dto.ChatDtos.SendMessageRequest;
import com.scrollshop.dto.GiftDtos.GiftWishlistDto;
import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.dto.SocialDtos.NotificationDto;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.UnauthorizedException;
import com.scrollshop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatVideoNotificationAndGiftTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ConversationParticipantRepository participantRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductService productService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private GiftWishlistRepository giftWishlistRepository;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private UserInteractionRepository userInteractionRepository;

    @InjectMocks
    private ChatService chatService;

    @InjectMocks
    private NotificationService notificationService;

    @InjectMocks
    private GiftService giftService;

    @InjectMocks
    private RecommendationService recommendationService;

    private User user1;
    private User user2;
    private User user3;
    private Conversation conversation;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        user1 = User.builder().id(1L).username("alice").isPersonalizationEnabled(true).build();
        user2 = User.builder().id(2L).username("bob").isPersonalizationEnabled(true).build();
        user3 = User.builder().id(3L).username("charlie").isPersonalizationEnabled(false).build();

        conversation = Conversation.builder().id(10L).title("Alice & Bob").isGroup(false).build();

        testProduct = Product.builder()
                .id(100L)
                .title("Nomad Keyboard")
                .price(new BigDecimal("7999.00"))
                .build();
    }

    @Test
    void getConversationMessages_UnauthorizedUser_ThrowsUnauthorizedException() {
        when(participantRepository.existsByConversationIdAndUserId(10L, 3L)).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> chatService.getConversationMessages(10L, user3));
    }

    @Test
    void sendMessage_WithSharedProduct_PersistsAndReturnsProductDetails() {
        when(participantRepository.existsByConversationIdAndUserId(10L, 1L)).thenReturn(true);
        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conversation));
        when(productRepository.findById(100L)).thenReturn(Optional.of(testProduct));
        when(productService.toProductDto(eq(testProduct), any())).thenReturn(
                ProductDto.builder().id(100L).title("Nomad Keyboard").price(new BigDecimal("7999.00")).build()
        );

        when(messageRepository.save(any(Message.class))).thenAnswer(i -> {
            Message m = i.getArgument(0);
            m.setId(500L);
            return m;
        });

        SendMessageRequest request = new SendMessageRequest();
        request.setContent("Hey check this keyboard out!");
        request.setSharedProductId(100L);

        MessageDto result = chatService.sendMessage(10L, user1, request);

        assertNotNull(result);
        assertEquals("Hey check this keyboard out!", result.getContent());
        assertNotNull(result.getSharedProduct());
        assertEquals("Nomad Keyboard", result.getSharedProduct().getTitle());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void notification_MarkAsRead_EnforcesOwnership() {
        Notification notification = Notification.builder()
                .id(1L)
                .recipient(user1)
                .isRead(false)
                .title("New Gift")
                .message("You received a gift!")
                .type(NotificationType.GIFT_RECEIVED)
                .build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        // User 2 trying to mark user 1's notification as read
        assertThrows(BadRequestException.class, () -> notificationService.markAsRead(1L, user2));
    }

    @Test
    void recommendation_DisabledPersonalization_ReturnsFeaturedDefaults() {
        when(productRepository.findByIsFeaturedTrue()).thenReturn(List.of(testProduct));
        when(productService.toProductDto(eq(testProduct), any())).thenReturn(
                ProductDto.builder().id(100L).title("Nomad Keyboard").build()
        );

        List<ProductDto> result = recommendationService.getRecommendedProducts(user3, 5);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userInteractionRepository, never()).findRecentInteractionsByUser(any(), any());
    }

    @Test
    void reserveWishlistItem_AlreadyReservedByAnotherFriend_ThrowsBadRequestException() {
        GiftWishlist wishlistItem = GiftWishlist.builder()
                .id(50L)
                .user(user1)
                .product(testProduct)
                .isReserved(true)
                .reservedBy(user3) // Reserved by Charlie
                .build();

        when(giftWishlistRepository.findById(50L)).thenReturn(Optional.of(wishlistItem));
        when(friendshipRepository.existsByUserIdAndFriendId(2L, 1L)).thenReturn(true);

        // Bob tries to reserve an item already reserved by Charlie
        assertThrows(BadRequestException.class, () -> giftService.reserveWishlistItem(user2, 50L));
    }
}

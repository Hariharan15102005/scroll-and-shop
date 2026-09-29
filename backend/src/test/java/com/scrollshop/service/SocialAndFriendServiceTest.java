package com.scrollshop.service;

import com.scrollshop.dto.SocialDtos.FriendDto;
import com.scrollshop.dto.SocialDtos.FriendRequestDto;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.BlockedUserRepository;
import com.scrollshop.repository.FriendRequestRepository;
import com.scrollshop.repository.FriendshipRepository;
import com.scrollshop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SocialAndFriendServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FriendRequestRepository friendRequestRepository;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private BlockedUserRepository blockedUserRepository;

    @InjectMocks
    private SocialService socialService;

    private User user1;
    private User user2;
    private FriendRequest pendingRequest;

    @BeforeEach
    void setUp() {
        user1 = User.builder().id(1L).username("user1").fullName("User One").build();
        user2 = User.builder().id(2L).username("user2").fullName("User Two").build();

        pendingRequest = FriendRequest.builder()
                .id(10L)
                .sender(user1)
                .receiver(user2)
                .status(FriendRequestStatus.PENDING)
                .build();
    }

    @Test
    void sendFriendRequest_ToSelf_ThrowsBadRequestException() {
        assertThrows(BadRequestException.class, () -> socialService.sendFriendRequest(user1, 1L));
        verify(friendRequestRepository, never()).save(any());
    }

    @Test
    void sendFriendRequest_TargetUserBlocked_ThrowsBadRequestException() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(blockedUserRepository.existsByUserIdAndBlockedUserId(2L, 1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> socialService.sendFriendRequest(user1, 2L));
    }

    @Test
    void sendFriendRequest_AlreadyFriends_ThrowsBadRequestException() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(blockedUserRepository.existsByUserIdAndBlockedUserId(2L, 1L)).thenReturn(false);
        when(friendshipRepository.existsByUserIdAndFriendId(1L, 2L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> socialService.sendFriendRequest(user1, 2L));
    }

    @Test
    void sendFriendRequest_DuplicatePending_ThrowsBadRequestException() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(blockedUserRepository.existsByUserIdAndBlockedUserId(2L, 1L)).thenReturn(false);
        when(friendshipRepository.existsByUserIdAndFriendId(1L, 2L)).thenReturn(false);
        when(friendRequestRepository.findExistingRequestBetween(1L, 2L)).thenReturn(Optional.of(pendingRequest));

        assertThrows(BadRequestException.class, () -> socialService.sendFriendRequest(user1, 2L));
    }

    @Test
    void sendFriendRequest_Success_CreatesPendingRequest() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(blockedUserRepository.existsByUserIdAndBlockedUserId(2L, 1L)).thenReturn(false);
        when(friendshipRepository.existsByUserIdAndFriendId(1L, 2L)).thenReturn(false);
        when(friendRequestRepository.findExistingRequestBetween(1L, 2L)).thenReturn(Optional.empty());
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(i -> {
            FriendRequest fr = i.getArgument(0);
            fr.setId(100L);
            return fr;
        });

        FriendRequestDto dto = socialService.sendFriendRequest(user1, 2L);

        assertNotNull(dto);
        assertEquals("PENDING", dto.getStatus());
        assertEquals("user1", dto.getSenderUsername());
        assertEquals("user2", dto.getReceiverUsername());
    }

    @Test
    void acceptFriendRequest_Success_CreatesMutualFriendships() {
        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(pendingRequest));
        when(friendRequestRepository.save(any(FriendRequest.class))).thenReturn(pendingRequest);

        FriendRequestDto dto = socialService.acceptFriendRequest(user2, 10L);

        assertNotNull(dto);
        assertEquals(FriendRequestStatus.ACCEPTED, pendingRequest.getStatus());
        verify(friendshipRepository, times(2)).save(any(Friendship.class));
    }

    @Test
    void acceptFriendRequest_WrongReceiver_ThrowsBadRequestException() {
        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(pendingRequest));

        User intruder = User.builder().id(3L).username("intruder").build();

        assertThrows(BadRequestException.class, () -> socialService.acceptFriendRequest(intruder, 10L));
    }

    @Test
    void cancelFriendRequest_Success_DeletesRequest() {
        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(pendingRequest));

        socialService.cancelFriendRequest(user1, 10L);

        verify(friendRequestRepository, times(1)).delete(pendingRequest);
    }

    @Test
    void cancelFriendRequest_WrongSender_ThrowsBadRequestException() {
        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(pendingRequest));

        assertThrows(BadRequestException.class, () -> socialService.cancelFriendRequest(user2, 10L));
    }

    @Test
    void blockUser_RemovesFriendshipAndAddsBlock() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(blockedUserRepository.existsByUserIdAndBlockedUserId(1L, 2L)).thenReturn(false);

        socialService.blockUser(user1, 2L);

        verify(friendshipRepository, times(1)).deleteByUserIdAndFriendId(1L, 2L);
        verify(friendshipRepository, times(1)).deleteByUserIdAndFriendId(2L, 1L);
        verify(blockedUserRepository, times(1)).save(any(BlockedUser.class));
    }
}

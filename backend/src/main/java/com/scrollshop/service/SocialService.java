package com.scrollshop.service;

import com.scrollshop.dto.SocialDtos.*;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.BlockedUserRepository;
import com.scrollshop.repository.FriendRequestRepository;
import com.scrollshop.repository.FriendshipRepository;
import com.scrollshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final BlockedUserRepository blockedUserRepository;

    @Transactional
    public FriendRequestDto sendFriendRequest(User sender, Long targetUserId) {
        if (sender.getId().equals(targetUserId)) {
            throw new BadRequestException("You cannot send a friend request to yourself");
        }

        User receiver = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        if (blockedUserRepository.existsByUserIdAndBlockedUserId(targetUserId, sender.getId())) {
            throw new BadRequestException("Unable to send request to this user");
        }

        if (friendshipRepository.existsByUserIdAndFriendId(sender.getId(), targetUserId)) {
            throw new BadRequestException("You are already friends with this user");
        }

        Optional<FriendRequest> existing = friendRequestRepository.findExistingRequestBetween(sender.getId(), targetUserId);
        if (existing.isPresent()) {
            FriendRequest fr = existing.get();
            if (fr.getStatus() == FriendRequestStatus.PENDING) {
                if (fr.getSender().getId().equals(sender.getId())) {
                    throw new BadRequestException("Friend request already sent and pending");
                } else {
                    // Auto-accept if mutual request
                    return acceptFriendRequest(sender, fr.getId());
                }
            } else {
                fr.setSender(sender);
                fr.setReceiver(receiver);
                fr.setStatus(FriendRequestStatus.PENDING);
                return toFriendRequestDto(friendRequestRepository.save(fr));
            }
        }

        FriendRequest newRequest = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        return toFriendRequestDto(friendRequestRepository.save(newRequest));
    }

    @Transactional
    public FriendRequestDto acceptFriendRequest(User receiver, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("FriendRequest", "id", requestId));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new BadRequestException("Unauthorized access to friend request");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        // Create mutual friendship records
        if (!friendshipRepository.existsByUserIdAndFriendId(receiver.getId(), request.getSender().getId())) {
            friendshipRepository.save(Friendship.builder().user(receiver).friend(request.getSender()).build());
        }
        if (!friendshipRepository.existsByUserIdAndFriendId(request.getSender().getId(), receiver.getId())) {
            friendshipRepository.save(Friendship.builder().user(request.getSender()).friend(receiver).build());
        }

        return toFriendRequestDto(request);
    }

    @Transactional
    public FriendRequestDto rejectFriendRequest(User receiver, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("FriendRequest", "id", requestId));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new BadRequestException("Unauthorized access to friend request");
        }

        request.setStatus(FriendRequestStatus.REJECTED);
        return toFriendRequestDto(friendRequestRepository.save(request));
    }

    @Transactional
    public void removeFriend(User user, Long friendId) {
        friendshipRepository.deleteByUserIdAndFriendId(user.getId(), friendId);
        friendshipRepository.deleteByUserIdAndFriendId(friendId, user.getId());
    }

    @Transactional
    public void blockUser(User user, Long targetUserId) {
        if (user.getId().equals(targetUserId)) {
            throw new BadRequestException("You cannot block yourself");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        // Remove friendships if any
        removeFriend(user, targetUserId);

        if (!blockedUserRepository.existsByUserIdAndBlockedUserId(user.getId(), targetUserId)) {
            blockedUserRepository.save(BlockedUser.builder().user(user).blockedUser(target).build());
        }
    }

    @Transactional
    public void unblockUser(User user, Long targetUserId) {
        blockedUserRepository.deleteByUserIdAndBlockedUserId(user.getId(), targetUserId);
    }

    public List<FriendDto> getFriends(Long userId) {
        return friendshipRepository.findByUserId(userId).stream()
                .map(f -> FriendDto.builder()
                        .id(f.getFriend().getId())
                        .username(f.getFriend().getUsername())
                        .fullName(f.getFriend().getFullName())
                        .avatarUrl(f.getFriend().getAvatarUrl())
                        .bio(f.getFriend().getBio())
                        .build())
                .collect(Collectors.toList());
    }

    public List<FriendRequestDto> getPendingRequests(Long userId) {
        return friendRequestRepository.findByReceiverIdAndStatus(userId, FriendRequestStatus.PENDING).stream()
                .map(this::toFriendRequestDto)
                .collect(Collectors.toList());
    }

    public List<FriendRequestDto> getOutgoingRequests(Long userId) {
        return friendRequestRepository.findBySenderIdAndStatus(userId, FriendRequestStatus.PENDING).stream()
                .map(this::toFriendRequestDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelFriendRequest(User sender, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("FriendRequest", "id", requestId));

        if (!request.getSender().getId().equals(sender.getId())) {
            throw new BadRequestException("Unauthorized access to friend request");
        }

        friendRequestRepository.delete(request);
    }

    public List<FriendDto> getSuggestedFriends(Long userId) {
        List<Long> existingFriendIds = friendshipRepository.findByUserId(userId).stream()
                .map(f -> f.getFriend().getId())
                .collect(Collectors.toList());
        existingFriendIds.add(userId);

        return userRepository.findAll().stream()
                .filter(u -> !existingFriendIds.contains(u.getId()))
                .filter(u -> !blockedUserRepository.existsByUserIdAndBlockedUserId(userId, u.getId()))
                .limit(20)
                .map(u -> FriendDto.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .avatarUrl(u.getAvatarUrl())
                        .bio(u.getBio())
                        .build())
                .collect(Collectors.toList());
    }

    public FriendRequestDto toFriendRequestDto(FriendRequest fr) {
        return FriendRequestDto.builder()
                .id(fr.getId())
                .senderId(fr.getSender().getId())
                .senderUsername(fr.getSender().getUsername())
                .senderFullName(fr.getSender().getFullName())
                .senderAvatar(fr.getSender().getAvatarUrl())
                .receiverId(fr.getReceiver().getId())
                .receiverUsername(fr.getReceiver().getUsername())
                .status(fr.getStatus().name())
                .createdAt(fr.getCreatedAt())
                .build();
    }
}

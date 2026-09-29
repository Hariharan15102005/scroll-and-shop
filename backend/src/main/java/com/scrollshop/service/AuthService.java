package com.scrollshop.service;

import com.scrollshop.config.JwtTokenProvider;
import com.scrollshop.dto.AddressDtos.AddressRequest;
import com.scrollshop.dto.AuthDtos.*;
import com.scrollshop.dto.SellerDtos.SellerProfileDto;
import com.scrollshop.dto.SellerDtos.SellerRegistrationRequest;
import com.scrollshop.entity.Address;
import com.scrollshop.entity.Role;
import com.scrollshop.entity.SellerProfile;
import com.scrollshop.entity.User;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final FriendshipRepository friendshipRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final PasswordValidationService passwordValidationService;
    private final AddressRepository addressRepository;
    private final SellerProfileRepository sellerProfileRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Validate password against length, blocklist, strength and predictability
        passwordValidationService.validatePassword(request.getPassword(), request.getUsername());

        if (userRepository.existsByUsername(request.getUsername().trim().toLowerCase())) {
            throw new BadRequestException("Username is already taken");
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already registered");
        }

        boolean isSeller = "SELLER".equalsIgnoreCase(request.getAccountType());
        Role userRole = isSeller ? Role.CREATOR : Role.USER;

        String interestsStr = null;
        if (request.getInterests() != null && !request.getInterests().isEmpty()) {
            interestsStr = String.join(", ", request.getInterests());
        }

        User user = User.builder()
                .username(request.getUsername().trim().toLowerCase())
                .email(request.getEmail() != null && !request.getEmail().trim().isEmpty() ? request.getEmail().trim().toLowerCase() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null && !request.getFullName().trim().isEmpty() ? request.getFullName().trim() : request.getUsername().trim())
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .bio(request.getBio())
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80")
                .role(userRole)
                .isPersonalizationEnabled(true)
                .interests(interestsStr)
                .feedPreference(request.getFeedPreference())
                .preferredBrands(request.getPreferredBrands())
                .preferredPriceRange(request.getPreferredPriceRange())
                .build();

        User savedUser = userRepository.save(user);

        // If Seller details provided, create SellerProfile
        SellerProfileDto sellerProfileDto = null;
        if (isSeller && request.getSellerDetails() != null) {
            SellerRegistrationRequest sReq = request.getSellerDetails();
            String handle = sReq.getStoreHandle() != null && !sReq.getStoreHandle().trim().isEmpty()
                    ? sReq.getStoreHandle().trim().toLowerCase().replaceAll("[^a-z0-9_-]", "")
                    : savedUser.getUsername() + "-store";

            if (sellerProfileRepository.existsByStoreHandle(handle)) {
                handle = handle + "-" + savedUser.getId();
            }

            SellerProfile sellerProfile = SellerProfile.builder()
                    .user(savedUser)
                    .storeName(sReq.getStoreName() != null ? sReq.getStoreName().trim() : savedUser.getFullName() + " Store")
                    .storeHandle(handle)
                    .businessType(sReq.getBusinessType())
                    .businessCategory(sReq.getBusinessCategory())
                    .storeDescription(sReq.getStoreDescription())
                    .businessEmail(sReq.getBusinessEmail() != null ? sReq.getBusinessEmail().trim() : savedUser.getEmail())
                    .businessPhone(sReq.getBusinessPhone() != null ? sReq.getBusinessPhone().trim() : savedUser.getPhoneNumber())
                    .businessAddress(sReq.getBusinessAddress())
                    .pickupAddress(sReq.getPickupAddress())
                    .operatingRegion(sReq.getOperatingRegion() != null ? sReq.getOperatingRegion() : "National")
                    .shippingPreference(sReq.getShippingPreference() != null ? sReq.getShippingPreference() : "Standard / Scroll Logistics")
                    .returnPolicy(sReq.getReturnPolicy())
                    .verificationStatus("ACTIVE")
                    .build();

            SellerProfile savedSeller = sellerProfileRepository.save(sellerProfile);
            sellerProfileDto = toSellerProfileDto(savedSeller);
        }

        // If Address provided during signup, save it
        if (request.getAddress() != null && request.getAddress().getStreet() != null && !request.getAddress().getStreet().trim().isEmpty()) {
            AddressRequest addrReq = request.getAddress();
            Address address = Address.builder()
                    .user(savedUser)
                    .recipientName(addrReq.getRecipientName() != null && !addrReq.getRecipientName().trim().isEmpty() ? addrReq.getRecipientName().trim() : savedUser.getFullName())
                    .phone(addrReq.getPhone() != null && !addrReq.getPhone().trim().isEmpty() ? addrReq.getPhone().trim() : (savedUser.getPhoneNumber() != null ? savedUser.getPhoneNumber() : "9999999999"))
                    .addressType(addrReq.getAddressType() != null ? addrReq.getAddressType() : "HOME")
                    .houseNumber(addrReq.getHouseNumber() != null ? addrReq.getHouseNumber().trim() : "1")
                    .buildingName(addrReq.getBuildingName())
                    .street(addrReq.getStreet().trim())
                    .area(addrReq.getArea() != null ? addrReq.getArea().trim() : "Downtown")
                    .landmark(addrReq.getLandmark())
                    .city(addrReq.getCity() != null ? addrReq.getCity().trim() : "City")
                    .district(addrReq.getDistrict())
                    .state(addrReq.getState() != null ? addrReq.getState().trim() : "State")
                    .postalCode(addrReq.getPostalCode() != null ? addrReq.getPostalCode().trim() : "560001")
                    .country(addrReq.getCountry() != null ? addrReq.getCountry().trim() : "India")
                    .isDefault(true)
                    .build();
            addressRepository.save(address);
        }

        String token = jwtTokenProvider.generateTokenForUsername(savedUser.getUsername(), savedUser.getId(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .avatarUrl(savedUser.getAvatarUrl())
                .role(savedUser.getRole().name())
                .phoneNumber(savedUser.getPhoneNumber())
                .isPersonalizationEnabled(savedUser.getIsPersonalizationEnabled())
                .sellerProfile(sellerProfileDto)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername() != null ? request.getUsername().toLowerCase().trim() : "";
        
        // Find actual username if identifier is email
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtTokenProvider.generateToken(authentication, user.getId(), user.getRole().name());

            SellerProfileDto sellerProfileDto = sellerProfileRepository.findByUserId(user.getId())
                    .map(this::toSellerProfileDto)
                    .orElse(null);

            return AuthResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .avatarUrl(user.getAvatarUrl())
                    .role(user.getRole().name())
                    .phoneNumber(user.getPhoneNumber())
                    .isPersonalizationEnabled(user.getIsPersonalizationEnabled())
                    .sellerProfile(sellerProfileDto)
                    .build();
        } catch (Exception e) {
            throw new BadRequestException("Invalid credentials");
        }
    }

    public UserProfileDto getProfile(Long currentUserId, Long targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        int friendCount = friendshipRepository.findByUserId(targetUserId).size();
        boolean isFriend = currentUserId != null && friendshipRepository.existsByUserIdAndFriendId(currentUserId, targetUserId);
        boolean isPendingRequest = currentUserId != null && friendRequestRepository.findBySenderIdAndReceiverId(currentUserId, targetUserId).isPresent();
        boolean isBlocked = currentUserId != null && blockedUserRepository.existsByUserIdAndBlockedUserId(currentUserId, targetUserId);

        SellerProfileDto sellerProfileDto = sellerProfileRepository.findByUserId(targetUserId)
                .map(this::toSellerProfileDto)
                .orElse(null);

        return UserProfileDto.builder()
                .id(target.getId())
                .username(target.getUsername())
                .email(target.getEmail())
                .fullName(target.getFullName())
                .bio(target.getBio())
                .avatarUrl(target.getAvatarUrl())
                .role(target.getRole().name())
                .phoneNumber(target.getPhoneNumber())
                .isPersonalizationEnabled(target.getIsPersonalizationEnabled())
                .interests(target.getInterests())
                .feedPreference(target.getFeedPreference())
                .preferredBrands(target.getPreferredBrands())
                .preferredPriceRange(target.getPreferredPriceRange())
                .friendCount(friendCount)
                .isFriend(isFriend)
                .isPendingRequest(isPendingRequest)
                .isBlocked(isBlocked)
                .sellerProfile(sellerProfileDto)
                .build();
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getBio() != null) user.setBio(request.getBio().trim());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl().trim());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getIsPersonalizationEnabled() != null) user.setIsPersonalizationEnabled(request.getIsPersonalizationEnabled());
        if (request.getInterests() != null) user.setInterests(request.getInterests().trim());
        if (request.getFeedPreference() != null) user.setFeedPreference(request.getFeedPreference().trim());
        if (request.getPreferredBrands() != null) user.setPreferredBrands(request.getPreferredBrands().trim());
        if (request.getPreferredPriceRange() != null) user.setPreferredPriceRange(request.getPreferredPriceRange().trim());

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
                throw new BadRequestException("Email is already used by another account");
            }
            user.setEmail(request.getEmail().trim().toLowerCase());
        }

        userRepository.save(user);
        return getProfile(userId, userId);
    }

    public UserProfileDto getProfileByUsername(Long currentUserId, String username) {
        User target = userRepository.findByUsername(username.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return getProfile(currentUserId, target.getId());
    }

    public List<UserProfileDto> searchUsers(Long currentUserId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.searchUsers(query.trim()).stream()
                .filter(u -> currentUserId == null || !u.getId().equals(currentUserId))
                .map(u -> getProfile(currentUserId, u.getId()))
                .collect(Collectors.toList());
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", auth.getName()));
    }

    public SellerProfileDto toSellerProfileDto(SellerProfile s) {
        if (s == null) return null;
        return SellerProfileDto.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .storeName(s.getStoreName())
                .storeHandle(s.getStoreHandle())
                .businessType(s.getBusinessType())
                .businessCategory(s.getBusinessCategory())
                .storeDescription(s.getStoreDescription())
                .businessEmail(s.getBusinessEmail())
                .businessPhone(s.getBusinessPhone())
                .businessAddress(s.getBusinessAddress())
                .pickupAddress(s.getPickupAddress())
                .operatingRegion(s.getOperatingRegion())
                .shippingPreference(s.getShippingPreference())
                .returnPolicy(s.getReturnPolicy())
                .verificationStatus(s.getVerificationStatus())
                .createdAt(s.getCreatedAt())
                .build();
    }
}

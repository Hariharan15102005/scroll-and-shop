package com.scrollshop.service;

import com.scrollshop.config.JwtTokenProvider;
import com.scrollshop.dto.AuthDtos.AuthResponse;
import com.scrollshop.dto.AuthDtos.RegisterRequest;
import com.scrollshop.entity.Role;
import com.scrollshop.entity.User;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.repository.AddressRepository;
import com.scrollshop.repository.BlockedUserRepository;
import com.scrollshop.repository.FriendRequestRepository;
import com.scrollshop.repository.FriendshipRepository;
import com.scrollshop.repository.SellerProfileRepository;
import com.scrollshop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private FriendRequestRepository friendRequestRepository;

    @Mock
    private PasswordValidationService passwordValidationService;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private SellerProfileRepository sellerProfileRepository;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .username("testuser")
                .email("test@scrollshop.com")
                .password("Password@123")
                .fullName("Test User")
                .build();
    }

    @Test
    void register_Success() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@scrollshop.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(10L)
                .username("testuser")
                .email("test@scrollshop.com")
                .passwordHash("encodedPassword")
                .fullName("Test User")
                .role(Role.USER)
                .isPersonalizationEnabled(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateTokenForUsername("testuser", 10L, "USER")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("mock-jwt-token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_DuplicateUsername_ThrowsBadRequestException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_Seller_Success() {
        RegisterRequest sellerReq = RegisterRequest.builder()
                .username("tech_merchant")
                .email("seller@scrollshop.com")
                .password("Password@123")
                .fullName("Tech Merchant Store")
                .accountType("SELLER")
                .sellerDetails(com.scrollshop.dto.SellerDtos.SellerRegistrationRequest.builder()
                        .storeName("Tech Galaxy")
                        .storeHandle("tech-galaxy")
                        .businessType("Private Limited")
                        .businessCategory("Electronics")
                        .build())
                .build();

        when(userRepository.existsByUsername("tech_merchant")).thenReturn(false);
        when(userRepository.existsByEmail("seller@scrollshop.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(25L)
                .username("tech_merchant")
                .email("seller@scrollshop.com")
                .passwordHash("encodedPassword")
                .fullName("Tech Merchant Store")
                .role(Role.CREATOR)
                .isPersonalizationEnabled(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateTokenForUsername("tech_merchant", 25L, "CREATOR")).thenReturn("mock-seller-jwt");

        AuthResponse response = authService.register(sellerReq);

        assertNotNull(response);
        assertEquals("CREATOR", response.getRole());
        verify(sellerProfileRepository, times(1)).save(any(com.scrollshop.entity.SellerProfile.class));
    }
}

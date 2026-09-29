package com.scrollshop.service;

import com.scrollshop.dto.CashbackDtos.ClaimCampaignRequest;
import com.scrollshop.dto.CashbackDtos.ClaimResponseDto;
import com.scrollshop.dto.SocialAccountDtos.ConnectSocialAccountRequest;
import com.scrollshop.dto.SocialAccountDtos.ConnectedSocialAccountDto;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CashbackAndSocialAccountTest {

    @Mock
    private CashbackTransactionRepository transactionRepository;

    @Mock
    private CashbackCampaignRepository campaignRepository;

    @Mock
    private CashbackClaimRepository claimRepository;

    @Mock
    private ConnectedSocialAccountRepository connectedSocialAccountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CashbackService cashbackService;

    private SocialAccountService socialAccountService;

    private User testUser;
    private Order testOrder;
    private CashbackCampaign testCampaign;

    @BeforeEach
    void setUp() {
        socialAccountService = new SocialAccountService(connectedSocialAccountRepository, userRepository, cashbackService);

        testUser = User.builder()
                .id(1L)
                .username("alex_tech")
                .email("alex@example.com")
                .fullName("Alex Tech")
                .role(Role.USER)
                .build();

        testOrder = Order.builder()
                .id(100L)
                .orderNumber("SNS-ORD-999")
                .user(testUser)
                .subtotalAmount(BigDecimal.valueOf(200.00))
                .totalAmount(BigDecimal.valueOf(236.00))
                .status(OrderStatus.PAID)
                .build();

        testCampaign = CashbackCampaign.builder()
                .id(5L)
                .title("Tech Reviewer Bounty")
                .rewardType("FIXED")
                .rewardValue(BigDecimal.valueOf(10.00))
                .activityType("PRODUCT_REVIEW")
                .isActive(true)
                .build();
    }

    @Test
    void recordPurchaseCashback_Success() {
        when(transactionRepository.existsByUserIdAndReferenceId(1L, "ORDER-SNS-ORD-999")).thenReturn(false);

        cashbackService.recordPurchaseCashback(testOrder);

        verify(transactionRepository, times(1)).save(argThat(tx ->
                tx.getAmount().compareTo(BigDecimal.valueOf(10.00)) == 0 && // 5% of 200 = 10.00
                tx.getStatus() == CashbackStatus.PENDING &&
                tx.getType() == CashbackType.PURCHASE_REWARD
        ));
    }

    @Test
    void recordPurchaseCashback_DuplicateIgnored() {
        when(transactionRepository.existsByUserIdAndReferenceId(1L, "ORDER-SNS-ORD-999")).thenReturn(true);

        cashbackService.recordPurchaseCashback(testOrder);

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void reversePurchaseCashback_Success() {
        CashbackTransaction existingTx = CashbackTransaction.builder()
                .id(20L)
                .user(testUser)
                .amount(BigDecimal.valueOf(10.00))
                .status(CashbackStatus.PENDING)
                .referenceId("ORDER-SNS-ORD-999")
                .description("5% Cashback on Order #SNS-ORD-999")
                .build();

        when(transactionRepository.findByUserIdAndReferenceId(1L, "ORDER-SNS-ORD-999"))
                .thenReturn(Optional.of(existingTx));

        cashbackService.reversePurchaseCashback(testOrder, "Customer Refund");

        assertEquals(CashbackStatus.REVERSED, existingTx.getStatus());
        assertTrue(existingTx.getDescription().contains("Reversed: Customer Refund"));
        verify(transactionRepository, times(1)).save(existingTx);
    }

    @Test
    void claimCampaign_Success() {
        when(campaignRepository.findById(5L)).thenReturn(Optional.of(testCampaign));
        when(claimRepository.existsByUserIdAndCampaignId(1L, 5L)).thenReturn(false);
        when(transactionRepository.existsByUserIdAndReferenceId(1L, "CLAIM-5-1")).thenReturn(false);

        CashbackClaim savedClaim = CashbackClaim.builder().id(50L).user(testUser).campaign(testCampaign).build();
        when(claimRepository.save(any(CashbackClaim.class))).thenReturn(savedClaim);

        ClaimCampaignRequest req = ClaimCampaignRequest.builder()
                .campaignId(5L)
                .claimDetails("Submitted unboxing video")
                .build();

        ClaimResponseDto resp = cashbackService.claimCampaign(testUser, req);

        assertNotNull(resp);
        assertEquals("APPROVED", resp.getStatus());
        assertEquals(BigDecimal.valueOf(10.00), resp.getRewardAmount());
        verify(transactionRepository, times(1)).save(any(CashbackTransaction.class));
    }

    @Test
    void claimCampaign_DuplicateClaim_ThrowsException() {
        when(campaignRepository.findById(5L)).thenReturn(Optional.of(testCampaign));
        when(claimRepository.existsByUserIdAndCampaignId(1L, 5L)).thenReturn(true);

        ClaimCampaignRequest req = ClaimCampaignRequest.builder().campaignId(5L).build();

        assertThrows(BadRequestException.class, () -> cashbackService.claimCampaign(testUser, req));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void connectSocialAccount_Success() {
        when(connectedSocialAccountRepository.findByUserIdAndProvider(1L, "INSTAGRAM"))
                .thenReturn(Optional.empty());

        ConnectedSocialAccount savedAcc = ConnectedSocialAccount.builder()
                .id(99L)
                .user(testUser)
                .provider("INSTAGRAM")
                .providerUsername("@alex_tech")
                .status("CONNECTED")
                .isVerified(true)
                .build();

        when(connectedSocialAccountRepository.save(any())).thenReturn(savedAcc);

        ConnectSocialAccountRequest req = ConnectSocialAccountRequest.builder()
                .provider("INSTAGRAM")
                .providerUsername("@alex_tech")
                .build();

        ConnectedSocialAccountDto dto = socialAccountService.connectAccount(testUser, req);

        assertNotNull(dto);
        assertEquals("INSTAGRAM", dto.getProvider());
        assertEquals("@alex_tech", dto.getProviderUsername());
        verify(connectedSocialAccountRepository, atLeastOnce()).save(any());
    }
}

package com.scrollshop.controller;

import com.scrollshop.dto.CashbackDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.CashbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cashback")
@RequiredArgsConstructor
public class CashbackController {

    private final CashbackService cashbackService;
    private final AuthService authService;

    @GetMapping("/overview")
    public ResponseEntity<CashbackOverviewDto> getOverview() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(cashbackService.getCashbackOverview(currentUser));
    }

    @GetMapping("/campaigns")
    public ResponseEntity<List<CashbackCampaignDto>> getCampaigns() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(cashbackService.getActiveCampaigns(currentUser));
    }

    @PostMapping("/claim")
    public ResponseEntity<ClaimResponseDto> claimReward(@Valid @RequestBody ClaimCampaignRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(cashbackService.claimCampaign(currentUser, request));
    }
}

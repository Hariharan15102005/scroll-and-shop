package com.scrollshop.controller;

import com.scrollshop.dto.SocialAccountDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.SocialAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social-accounts")
@RequiredArgsConstructor
public class SocialAccountController {

    private final SocialAccountService socialAccountService;
    private final AuthService authService;

    @GetMapping("/providers")
    public ResponseEntity<List<SocialProviderConfigDto>> getSupportedProviders() {
        return ResponseEntity.ok(socialAccountService.getSupportedProviders());
    }

    @GetMapping("/my-accounts")
    public ResponseEntity<List<ConnectedSocialAccountDto>> getMyAccounts() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialAccountService.getUserConnectedAccounts(currentUser.getId()));
    }

    @PostMapping("/connect")
    public ResponseEntity<ConnectedSocialAccountDto> connectAccount(@Valid @RequestBody ConnectSocialAccountRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialAccountService.connectAccount(currentUser, request));
    }

    @DeleteMapping("/disconnect/{provider}")
    public ResponseEntity<Void> disconnectAccount(@PathVariable String provider) {
        User currentUser = authService.getCurrentUser();
        socialAccountService.disconnectAccount(currentUser, provider);
        return ResponseEntity.noContent().build();
    }
}

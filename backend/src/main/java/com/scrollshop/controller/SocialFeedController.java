package com.scrollshop.controller;

import com.scrollshop.dto.SocialFeedDtos.SocialFeedResponseDto;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.SocialFeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class SocialFeedController {

    private final SocialFeedService socialFeedService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<SocialFeedResponseDto> getFeed(
            @RequestParam(defaultValue = "FOR_YOU") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(socialFeedService.getBlendedFeed(currentUser, filter, page, size));
    }
}

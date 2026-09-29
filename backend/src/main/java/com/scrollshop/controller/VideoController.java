package com.scrollshop.controller;

import com.scrollshop.dto.VideoDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.VideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<Page<ShoppingVideoDto>> getVideoFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(videoService.getVideoFeed(page, size));
    }

    @PostMapping
    public ResponseEntity<ShoppingVideoDto> uploadVideo(@Valid @RequestBody UploadVideoRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(videoService.uploadVideo(currentUser, request));
    }

    @PostMapping("/{videoId}/view")
    public ResponseEntity<Void> recordView(@PathVariable Long videoId) {
        videoService.incrementViews(videoId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{videoId}/like")
    public ResponseEntity<Integer> likeVideo(@PathVariable Long videoId) {
        return ResponseEntity.ok(videoService.likeVideo(videoId));
    }
}

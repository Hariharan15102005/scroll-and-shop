package com.scrollshop.service;

import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.dto.SocialFeedDtos.*;
import com.scrollshop.dto.VideoDtos.ShoppingVideoDto;
import com.scrollshop.entity.Product;
import com.scrollshop.entity.ShoppingVideo;
import com.scrollshop.entity.SocialPost;
import com.scrollshop.entity.User;
import com.scrollshop.repository.ProductRepository;
import com.scrollshop.repository.ShoppingVideoRepository;
import com.scrollshop.repository.SocialPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialFeedService {

    private final SocialPostRepository socialPostRepository;
    private final ProductRepository productRepository;
    private final ShoppingVideoRepository videoRepository;
    private final ProductService productService;
    private final VideoService videoService;

    public SocialFeedResponseDto getBlendedFeed(User currentUser, String filter, int page, int size) {
        List<FeedItemDto> feedItems = new ArrayList<>();

        // Fetch items
        List<SocialPost> socialPosts = socialPostRepository.findByIsPublicTrueOrderByCreatedAtDesc(PageRequest.of(0, 30));
        List<ShoppingVideoDto> videos = videoService.getAllVideos(currentUser != null ? currentUser.getId() : null);
        List<Product> products = productRepository.findAllByOrderByCreatedAtDesc();

        if ("VIDEOS".equalsIgnoreCase(filter)) {
            for (ShoppingVideoDto v : videos) {
                feedItems.add(FeedItemDto.builder()
                        .id("vid_" + v.getId())
                        .itemType("SHOPPING_VIDEO")
                        .contentRatioCategory("SHOPPING")
                        .video(v)
                        .timestamp(v.getCreatedAt())
                        .build());
            }
        } else if ("SHOPPING".equalsIgnoreCase(filter)) {
            for (Product p : products) {
                feedItems.add(FeedItemDto.builder()
                        .id("prod_" + p.getId())
                        .itemType("SHOPPING_PRODUCT")
                        .contentRatioCategory("SHOPPING")
                        .product(productService.toProductDto(p, currentUser != null ? currentUser.getId() : null))
                        .timestamp(p.getCreatedAt())
                        .build());
            }
        } else {
            // "FOR_YOU" or blended feed: target 30% Social & 70% Shopping mix
            int sIdx = 0;
            int vIdx = 0;
            int pIdx = 0;

            int maxItems = Math.min(60, socialPosts.size() + videos.size() + products.size());

            // Build an alternating sequence: 1 Social Post, then 2-3 Shopping/Video Items
            while (feedItems.size() < maxItems && (sIdx < socialPosts.size() || vIdx < videos.size() || pIdx < products.size())) {
                // 1. Add 1 Social Post (~30%)
                if (sIdx < socialPosts.size()) {
                    SocialPost post = socialPosts.get(sIdx++);
                    feedItems.add(FeedItemDto.builder()
                            .id("post_" + post.getId())
                            .itemType("SOCIAL_POST")
                            .contentRatioCategory("SOCIAL")
                            .postId(post.getId())
                            .creatorUsername(post.getUser().getUsername())
                            .creatorFullName(post.getUser().getFullName())
                            .creatorAvatar(post.getUser().getAvatarUrl())
                            .creatorRole(post.getUser().getRole().name())
                            .postContent(post.getContent())
                            .postImageUrl(post.getImageUrl())
                            .likeCount(post.getLikeCount())
                            .commentCount(post.getCommentCount())
                            .isLikedByMe(false)
                            .timestamp(post.getCreatedAt())
                            .build());
                }

                // 2. Add 1 Shopping Video (~35%)
                if (vIdx < videos.size()) {
                    ShoppingVideoDto v = videos.get(vIdx++);
                    feedItems.add(FeedItemDto.builder()
                            .id("vid_" + v.getId())
                            .itemType("SHOPPING_VIDEO")
                            .contentRatioCategory("SHOPPING")
                            .video(v)
                            .timestamp(v.getCreatedAt())
                            .build());
                }

                // 3. Add 1-2 Shopping Products (~35%)
                if (pIdx < products.size()) {
                    Product p = products.get(pIdx++);
                    feedItems.add(FeedItemDto.builder()
                            .id("prod_" + p.getId())
                            .itemType("SHOPPING_PRODUCT")
                            .contentRatioCategory("SHOPPING")
                            .product(productService.toProductDto(p, currentUser != null ? currentUser.getId() : null))
                            .timestamp(p.getCreatedAt())
                            .build());
                }

                if (pIdx < products.size() && feedItems.size() % 4 == 0) {
                    Product p = products.get(pIdx++);
                    feedItems.add(FeedItemDto.builder()
                            .id("prod_" + p.getId())
                            .itemType("SHOPPING_PRODUCT")
                            .contentRatioCategory("SHOPPING")
                            .product(productService.toProductDto(p, currentUser != null ? currentUser.getId() : null))
                            .timestamp(p.getCreatedAt())
                            .build());
                }
            }
        }

        long socialCount = feedItems.stream().filter(i -> "SOCIAL".equals(i.getContentRatioCategory())).count();
        long shoppingCount = feedItems.stream().filter(i -> "SHOPPING".equals(i.getContentRatioCategory())).count();
        int total = feedItems.size();

        double sRatio = total > 0 ? Math.round(((double) socialCount / total) * 100.0) : 30.0;
        double shRatio = total > 0 ? Math.round(((double) shoppingCount / total) * 100.0) : 70.0;

        return SocialFeedResponseDto.builder()
                .items(feedItems)
                .totalCount(total)
                .socialRatio(sRatio)
                .shoppingRatio(shRatio)
                .build();
    }
}

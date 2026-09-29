package com.scrollshop.service;

import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.dto.VideoDtos.*;
import com.scrollshop.entity.Product;
import com.scrollshop.entity.ShoppingVideo;
import com.scrollshop.entity.User;
import com.scrollshop.entity.VideoProductTag;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.ProductRepository;
import com.scrollshop.repository.ShoppingVideoRepository;
import com.scrollshop.repository.VideoProductTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final ShoppingVideoRepository videoRepository;
    private final VideoProductTagRepository tagRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public Page<ShoppingVideoDto> getVideoFeed(int page, int size) {
        Page<ShoppingVideo> videos = videoRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return videos.map(this::toVideoDto);
    }

    public List<ShoppingVideoDto> getAllVideos(Long currentUserId) {
        return videoRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(this::toVideoDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ShoppingVideoDto uploadVideo(User creator, UploadVideoRequest request) {
        ShoppingVideo video = ShoppingVideo.builder()
                .creator(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .videoUrl(request.getVideoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .likesCount(0)
                .viewsCount(0)
                .build();

        ShoppingVideo savedVideo = videoRepository.save(video);

        if (request.getTaggedProductIds() != null && !request.getTaggedProductIds().isEmpty()) {
            List<Product> products = productRepository.findByIds(request.getTaggedProductIds());
            List<VideoProductTag> tags = new ArrayList<>();
            for (Product p : products) {
                tags.add(VideoProductTag.builder().video(savedVideo).product(p).build());
            }
            tagRepository.saveAll(tags);
            savedVideo.setTaggedProducts(tags);
        }

        return toVideoDto(savedVideo);
    }

    @Transactional
    public void incrementViews(Long videoId) {
        ShoppingVideo video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));
        video.setViewsCount(video.getViewsCount() + 1);
        videoRepository.save(video);
    }

    @Transactional
    public int likeVideo(Long videoId) {
        ShoppingVideo video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));
        video.setLikesCount(video.getLikesCount() + 1);
        videoRepository.save(video);
        return video.getLikesCount();
    }

    public ShoppingVideoDto toVideoDto(ShoppingVideo video) {
        List<ProductDto> tagged = (video.getTaggedProducts() != null) ?
                video.getTaggedProducts().stream()
                        .map(tag -> productService.toProductDto(tag.getProduct(), null))
                        .collect(Collectors.toList()) :
                List.of();

        return ShoppingVideoDto.builder()
                .id(video.getId())
                .creatorId(video.getCreator().getId())
                .creatorUsername(video.getCreator().getUsername())
                .creatorFullName(video.getCreator().getFullName())
                .creatorAvatar(video.getCreator().getAvatarUrl())
                .title(video.getTitle())
                .description(video.getDescription())
                .videoUrl(video.getVideoUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .likesCount(video.getLikesCount())
                .viewsCount(video.getViewsCount())
                .taggedProducts(tagged)
                .createdAt(video.getCreatedAt())
                .build();
    }
}

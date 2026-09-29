package com.scrollshop.repository;

import com.scrollshop.entity.SocialPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialPostRepository extends JpaRepository<SocialPost, Long> {
    List<SocialPost> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);
    List<SocialPost> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SocialPost> findByCategoryAndIsPublicTrueOrderByCreatedAtDesc(String category, Pageable pageable);
}

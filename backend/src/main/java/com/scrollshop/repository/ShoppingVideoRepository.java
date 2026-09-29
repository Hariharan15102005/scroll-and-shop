package com.scrollshop.repository;

import com.scrollshop.entity.ShoppingVideo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingVideoRepository extends JpaRepository<ShoppingVideo, Long> {
    Page<ShoppingVideo> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<ShoppingVideo> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
}

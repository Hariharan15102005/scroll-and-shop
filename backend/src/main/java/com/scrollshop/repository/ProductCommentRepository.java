package com.scrollshop.repository;

import com.scrollshop.entity.ProductComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCommentRepository extends JpaRepository<ProductComment, Long> {
    List<ProductComment> findByProductIdAndParentCommentIsNullOrderByCreatedAtDesc(Long productId);
    long countByProductId(Long productId);
}

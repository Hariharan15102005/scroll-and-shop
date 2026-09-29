package com.scrollshop.repository;

import com.scrollshop.entity.InteractionType;
import com.scrollshop.entity.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {

    @Query("SELECT ui FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.createdAt >= :sinceDate ORDER BY ui.createdAt DESC")
    List<UserInteraction> findRecentInteractionsByUser(@Param("userId") Long userId, @Param("sinceDate") LocalDateTime sinceDate);

    @Query("SELECT ui.product.category.id, SUM(ui.weight) FROM UserInteraction ui " +
           "WHERE ui.user.id = :userId AND ui.createdAt >= :sinceDate " +
           "GROUP BY ui.product.category.id ORDER BY SUM(ui.weight) DESC")
    List<Object[]> findTopCategoryInteractions(@Param("userId") Long userId, @Param("sinceDate") LocalDateTime sinceDate);

    @Query("SELECT ui.product.id FROM UserInteraction ui " +
           "WHERE ui.user.id = :userId AND ui.interactionType = :interactionType")
    List<Long> findProductIdsByUserAndInteractionType(@Param("userId") Long userId, @Param("interactionType") InteractionType interactionType);

    void deleteByUserId(Long userId);
}

package com.scrollshop.repository;

import com.scrollshop.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.user.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findConversationsForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c " +
           "JOIN c.participants p1 JOIN c.participants p2 " +
           "WHERE c.isGroup = false AND p1.user.id = :u1 AND p2.user.id = :u2")
    Optional<Conversation> findDirectConversationBetween(@Param("u1") Long u1, @Param("u2") Long u2);
}

package com.scrollshop.repository;

import com.scrollshop.entity.CashbackStatus;
import com.scrollshop.entity.CashbackTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CashbackTransactionRepository extends JpaRepository<CashbackTransaction, Long> {
    List<CashbackTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CashbackTransaction> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, CashbackStatus status);
    Optional<CashbackTransaction> findByUserIdAndReferenceId(Long userId, String referenceId);
    boolean existsByUserIdAndReferenceId(Long userId, String referenceId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CashbackTransaction t WHERE t.user.id = :userId AND t.status = 'APPROVED'")
    BigDecimal calculateApprovedBalance(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CashbackTransaction t WHERE t.user.id = :userId AND t.status = 'PENDING'")
    BigDecimal calculatePendingBalance(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CashbackTransaction t WHERE t.user.id = :userId AND (t.status = 'APPROVED' OR t.status = 'PENDING') AND t.amount > 0")
    BigDecimal calculateLifetimeEarned(@Param("userId") Long userId);
}

package com.scrollshop.repository;

import com.scrollshop.entity.ConnectedSocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectedSocialAccountRepository extends JpaRepository<ConnectedSocialAccount, Long> {
    List<ConnectedSocialAccount> findByUserId(Long userId);
    Optional<ConnectedSocialAccount> findByUserIdAndProvider(Long userId, String provider);
    boolean existsByUserIdAndProvider(Long userId, String provider);
    void deleteByUserIdAndProvider(Long userId, String provider);
}

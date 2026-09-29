package com.scrollshop.repository;

import com.scrollshop.entity.SellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {

    Optional<SellerProfile> findByUserId(Long userId);

    Optional<SellerProfile> findByStoreHandle(String storeHandle);

    boolean existsByStoreHandle(String storeHandle);
}

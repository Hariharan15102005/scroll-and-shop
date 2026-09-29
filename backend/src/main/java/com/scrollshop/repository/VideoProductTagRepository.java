package com.scrollshop.repository;

import com.scrollshop.entity.VideoProductTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoProductTagRepository extends JpaRepository<VideoProductTag, Long> {
    List<VideoProductTag> findByVideoId(Long videoId);
}

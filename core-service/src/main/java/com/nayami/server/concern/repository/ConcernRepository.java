package com.nayami.server.concern.repository;

import com.nayami.server.concern.entity.Concern;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConcernRepository extends JpaRepository<Concern, Long> {

  // ORDER BY RAND(), LIMIT은 표준 JPQL 미지원으로 네이티브 쿼리 사용
  @Query(value = """
      SELECT * FROM concerns
      WHERE status = 'ACTIVE'
      AND safe_reply_count < 3
      AND (first_safe_reply_at IS NULL OR first_safe_reply_at > :twoWeeksAgo)
      AND author_id != :userId
      AND id NOT IN (SELECT concern_id FROM replies WHERE author_id = :userId)
      ORDER BY RAND()
      LIMIT 1
      """, nativeQuery = true)
  Optional<Concern> findRandom(
      @Param("twoWeeksAgo") LocalDateTime twoWeeksAgo,
      @Param("userId") Long userId
  );
}
package com.nayami.server.concern.repository;

import com.nayami.server.concern.entity.Concern;
import com.nayami.server.concern.entity.ConcernStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConcernRepository extends JpaRepository<Concern, Long> {

  @Query("""
      SELECT c FROM Concern c
      WHERE c.status = :status
      AND c.safeReplyCount < 3
      AND (c.firstSafeReplyAt IS NULL OR c.firstSafeReplyAt > :twoWeeksAgo)
      """)
  List<Concern> findVisible(
      @Param("status") ConcernStatus status,
      @Param("twoWeeksAgo") LocalDateTime twoWeeksAgo
  );
}
package com.nayami.server.reply.repository;

import com.nayami.server.reply.entity.Reply;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

  @Query("SELECT r FROM Reply r JOIN FETCH r.concern WHERE r.id = :id")
  Optional<Reply> findByIdWithConcern(@Param("id") Long id);
}
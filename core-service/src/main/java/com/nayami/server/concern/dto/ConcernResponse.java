package com.nayami.server.concern.dto;

import com.nayami.server.concern.entity.Concern;
import java.time.LocalDateTime;

public record ConcernResponse(
    Long id,
    String nickname,
    String content,
    LocalDateTime createdAt
) {

  public static ConcernResponse from(Concern concern) {
    return new ConcernResponse(
        concern.getId(),
        concern.getAuthor().getNickname(),
        concern.getContent(),
        concern.getCreatedAt()
    );
  }
}
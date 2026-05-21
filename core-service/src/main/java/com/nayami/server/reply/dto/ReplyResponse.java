package com.nayami.server.reply.dto;

import com.nayami.server.reply.entity.Reply;
import com.nayami.server.reply.entity.ReplyStatus;
import java.time.LocalDateTime;

public record ReplyResponse(
    Long id,
    Long concernId,
    String nickname,
    String content,
    ReplyStatus status,
    LocalDateTime createdAt
) {

  public static ReplyResponse from(Reply reply) {
    return new ReplyResponse(
        reply.getId(),
        reply.getConcern().getId(),
        reply.getAuthor().getNickname(),
        reply.getContent(),
        reply.getStatus(),
        reply.getCreatedAt()
    );
  }
}
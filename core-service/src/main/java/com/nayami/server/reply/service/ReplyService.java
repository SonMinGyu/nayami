package com.nayami.server.reply.service;

import com.nayami.server.concern.entity.Concern;
import com.nayami.server.concern.repository.ConcernRepository;
import com.nayami.server.global.exception.NotFoundException;
import com.nayami.server.reply.dto.ReplyCreateRequest;
import com.nayami.server.reply.dto.ReplyResponse;
import com.nayami.server.reply.entity.Reply;
import com.nayami.server.reply.repository.ReplyRepository;
import com.nayami.server.sqs.dto.ReplyCheckRequestMessage;
import com.nayami.server.sqs.publisher.ReplyCheckRequestPublisher;
import com.nayami.server.user.entity.User;
import com.nayami.server.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReplyService {

  private final ReplyRepository replyRepository;
  private final ConcernRepository concernRepository;
  private final UserService userService;
  private final ReplyCheckRequestPublisher replyCheckRequestPublisher;

  @Transactional
  public ReplyResponse create(Long concernId, ReplyCreateRequest request) {
    Concern concern = concernRepository.findById(concernId)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 고민입니다. id=" + concernId));
    User author = userService.findOrCreate(request.nickname(), request.email());
    Reply reply = replyRepository.save(Reply.of(concern, author, request.content()));
    return ReplyResponse.from(reply);
  }

  // 트랜잭션 밖에서 호출 — DB 커밋 이후 SQS 발행 보장
  public void publishCheckRequest(ReplyResponse reply, String concernContent) {
    replyCheckRequestPublisher.publish(new ReplyCheckRequestMessage(
        reply.id(),
        concernContent,
        reply.content()
    ));
  }

  @Transactional
  public void handleCheckResult(Long replyId, boolean isSafe, String reason) {
    Reply reply = replyRepository.findByIdWithConcern(replyId)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 답변입니다. id=" + replyId));
    reply.updateCheckResult(isSafe, reason);
    if (isSafe) {
      reply.getConcern().recordSafeReply();
    }
  }
}
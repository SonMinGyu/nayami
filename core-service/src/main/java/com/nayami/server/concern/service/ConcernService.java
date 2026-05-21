package com.nayami.server.concern.service;

import com.nayami.server.concern.dto.ConcernCreateRequest;
import com.nayami.server.concern.dto.ConcernResponse;
import com.nayami.server.concern.entity.Concern;
import com.nayami.server.concern.entity.ConcernStatus;
import com.nayami.server.concern.repository.ConcernRepository;
import com.nayami.server.global.exception.NotFoundException;
import com.nayami.server.sqs.dto.ConcernCheckRequestMessage;
import com.nayami.server.sqs.publisher.ConcernCheckRequestPublisher;
import com.nayami.server.user.entity.User;
import com.nayami.server.user.service.UserService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConcernService {

  private final ConcernRepository concernRepository;
  private final UserService userService;
  private final ConcernCheckRequestPublisher concernCheckRequestPublisher;

  @Transactional
  public ConcernResponse create(ConcernCreateRequest request) {
    User author = userService.findOrCreate(request.nickname(), request.email());
    Concern concern = concernRepository.save(Concern.of(author, request.content()));
    return ConcernResponse.from(concern);
  }

  // 트랜잭션 밖에서 호출 — DB 커밋 이후 SQS 발행 보장
  public void publishCheckRequest(ConcernResponse concern) {
    concernCheckRequestPublisher.publish(
        new ConcernCheckRequestMessage(concern.id(), concern.content())
    );
  }

  @Transactional
  public void handleCheckResult(Long concernId, boolean isSafe) {
    Concern concern = concernRepository.findById(concernId)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 고민입니다. id=" + concernId));
    concern.updateCheckResult(isSafe);
  }

  @Transactional(readOnly = true)
  public List<ConcernResponse> findAll() {
    LocalDateTime twoWeeksAgo = LocalDateTime.now().minusWeeks(2);
    return concernRepository.findVisible(ConcernStatus.ACTIVE, twoWeeksAgo).stream()
        .map(ConcernResponse::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public ConcernResponse findById(Long id) {
    Concern concern = concernRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 고민입니다. id=" + id));
    return ConcernResponse.from(concern);
  }
}
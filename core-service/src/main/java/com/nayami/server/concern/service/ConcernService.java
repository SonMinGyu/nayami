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

  // 인증된 사용자를 조회하고 고민을 저장한다.
  @Transactional
  public ConcernResponse create(Long userId, ConcernCreateRequest request) {
    User author = userService.findById(userId);
    Concern concern = concernRepository.save(Concern.of(author, request.content()));
    return ConcernResponse.from(concern);
  }

  // AI 서비스에 고민 내용 유해성 검사를 요청하는 SQS 메시지를 발행한다.
  // 트랜잭션 밖에서 호출 — DB 커밋 이후 SQS 발행 보장
  public void publishCheckRequest(ConcernResponse concern) {
    concernCheckRequestPublisher.publish(
        new ConcernCheckRequestMessage(concern.id(), concern.content())
    );
  }

  // AI 서비스의 검사 결과를 받아 고민 상태를 업데이트한다.
  @Transactional
  public void handleCheckResult(Long concernId, boolean isSafe) {
    Concern concern = concernRepository.findById(concernId)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 고민입니다. id=" + concernId));
    concern.updateCheckResult(isSafe);
  }

  // 2주 이내에 등록된 활성 상태의 고민 목록을 조회한다.
  @Transactional(readOnly = true)
  public List<ConcernResponse> findAll() {
    LocalDateTime twoWeeksAgo = LocalDateTime.now().minusWeeks(2);
    return concernRepository.findVisible(ConcernStatus.ACTIVE, twoWeeksAgo).stream()
        .map(ConcernResponse::from)
        .toList();
  }

  // ID로 고민을 조회한다.
  @Transactional(readOnly = true)
  public ConcernResponse findById(Long id) {
    Concern concern = concernRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 고민입니다. id=" + id));
    return ConcernResponse.from(concern);
  }
}
package com.nayami.server.global.outbox;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventRelayer {

  private final TaskScheduler taskScheduler;
  private final OutboxEventProcessor outboxEventProcessor;

  @EventListener(ApplicationReadyEvent.class)
  public void start() {
    taskScheduler.scheduleWithFixedDelay(outboxEventProcessor::process, Duration.ofSeconds(10));
    log.info("Outbox 릴레이어 시작 — 폴링 간격: 10초");
  }
}
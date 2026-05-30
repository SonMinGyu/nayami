package com.nayami.server.global.outbox;

import com.nayami.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "outbox_events")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OutboxEvent extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OutboxEventType eventType;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String payload;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OutboxEventStatus status;

  @Column(nullable = false)
  private int retryCount;

  private LocalDateTime processedAt;

  public static OutboxEvent pending(OutboxEventType eventType, String payload) {
    OutboxEvent event = new OutboxEvent();
    event.eventType = eventType;
    event.payload = payload;
    event.status = OutboxEventStatus.PENDING;
    event.retryCount = 0;
    return event;
  }

  public void markProcessed() {
    this.status = OutboxEventStatus.PROCESSED;
    this.processedAt = LocalDateTime.now();
  }

  public void incrementRetry(int maxRetry) {
    this.retryCount++;
    if (this.retryCount >= maxRetry) {
      this.status = OutboxEventStatus.FAILED;
    }
  }
}
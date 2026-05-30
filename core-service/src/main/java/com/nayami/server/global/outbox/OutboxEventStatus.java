package com.nayami.server.global.outbox;

public enum OutboxEventStatus {
  PENDING,
  PROCESSED,
  FAILED
}
package com.nayami.server.sqs.publisher;

import com.nayami.server.sqs.dto.ReplyCheckRequestMessage;

public interface ReplyCheckRequestPublisher {

  void publish(ReplyCheckRequestMessage message);
}
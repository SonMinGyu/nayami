package com.nayami.server.sqs.publisher;

import com.nayami.server.sqs.dto.ConcernCheckRequestMessage;

public interface ConcernCheckRequestPublisher {

  void publish(ConcernCheckRequestMessage message);
}
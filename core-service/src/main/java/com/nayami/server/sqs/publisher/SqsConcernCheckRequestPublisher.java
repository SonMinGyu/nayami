package com.nayami.server.sqs.publisher;

import com.nayami.server.sqs.config.SqsProperties;
import com.nayami.server.sqs.dto.ConcernCheckRequestMessage;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SqsConcernCheckRequestPublisher implements ConcernCheckRequestPublisher {

  private final SqsTemplate sqsTemplate;
  private final SqsProperties sqsProperties;

  @Override
  public void publish(ConcernCheckRequestMessage message) {
    sqsTemplate.send(sqsProperties.concernCheckRequestQueueUrl(), message);
  }
}
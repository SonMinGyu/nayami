package com.nayami.server.sqs.publisher;

import com.nayami.server.sqs.config.SqsProperties;
import com.nayami.server.sqs.dto.ReplyCheckRequestMessage;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SqsReplyCheckRequestPublisher implements ReplyCheckRequestPublisher {

  private final SqsTemplate sqsTemplate;
  private final SqsProperties sqsProperties;

  @Override
  public void publish(ReplyCheckRequestMessage message) {
    sqsTemplate.send(sqsProperties.replyCheckRequestQueueUrl(), message);
  }
}
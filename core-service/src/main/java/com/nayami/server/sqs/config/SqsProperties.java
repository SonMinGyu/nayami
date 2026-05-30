package com.nayami.server.sqs.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sqs")
public record SqsProperties(
    String concernCheckRequestQueueUrl,
    String concernCheckResultQueueUrl,
    String replyCheckRequestQueueUrl,
    String replyCheckResultQueueUrl,
    String emailNotificationQueueUrl
) {

}
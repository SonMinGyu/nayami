package com.nayami.server.global.config;

import com.nayami.server.sqs.config.SqsProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SqsProperties.class)
public class SqsConfig {

}
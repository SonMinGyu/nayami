package com.nayami.server.reply.controller;

import com.nayami.server.concern.service.ConcernService;
import com.nayami.server.reply.dto.ReplyCreateRequest;
import com.nayami.server.reply.dto.ReplyResponse;
import com.nayami.server.reply.service.ReplyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/concerns")
@RequiredArgsConstructor
public class ReplyController {

  private final ReplyService replyService;
  private final ConcernService concernService;

  @PostMapping("/{concernId}/replies")
  public ResponseEntity<ReplyResponse> create(
      @PathVariable Long concernId,
      @Valid @RequestBody ReplyCreateRequest request
  ) {
    ReplyResponse reply = replyService.create(concernId, request);
    String concernContent = concernService.findById(concernId).content();
    replyService.publishCheckRequest(reply, concernContent);
    return ResponseEntity.status(HttpStatus.CREATED).body(reply);
  }
}
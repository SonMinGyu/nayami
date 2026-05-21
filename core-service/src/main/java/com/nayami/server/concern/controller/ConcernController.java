package com.nayami.server.concern.controller;

import com.nayami.server.concern.dto.ConcernCreateRequest;
import com.nayami.server.concern.dto.ConcernResponse;
import com.nayami.server.concern.service.ConcernService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/concerns")
@RequiredArgsConstructor
public class ConcernController {

  private final ConcernService concernService;

  @PostMapping
  public ResponseEntity<ConcernResponse> create(@Valid @RequestBody ConcernCreateRequest request) {
    ConcernResponse concern = concernService.create(request);
    concernService.publishCheckRequest(concern);
    return ResponseEntity.status(HttpStatus.CREATED).body(concern);
  }

  @GetMapping
  public ResponseEntity<List<ConcernResponse>> findAll() {
    return ResponseEntity.ok(concernService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ConcernResponse> findById(@PathVariable Long id) {
    return ResponseEntity.ok(concernService.findById(id));
  }
}
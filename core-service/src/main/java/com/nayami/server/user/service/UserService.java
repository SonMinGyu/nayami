package com.nayami.server.user.service;

import com.nayami.server.global.exception.NotFoundException;
import com.nayami.server.user.entity.User;
import com.nayami.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;

  // ID로 사용자를 조회한다.
  @Transactional(readOnly = true)
  public User findById(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다. id=" + userId));
  }
}
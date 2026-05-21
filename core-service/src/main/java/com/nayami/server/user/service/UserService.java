package com.nayami.server.user.service;

import com.nayami.server.user.entity.User;
import com.nayami.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;

  @Transactional
  public User findOrCreate(String nickname, String email) {
    return userRepository.findByNicknameAndEmail(nickname, email)
        .orElseGet(() -> userRepository.save(User.of(nickname, email)));
  }
}
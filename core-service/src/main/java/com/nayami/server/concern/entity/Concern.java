package com.nayami.server.concern.entity;

import com.nayami.server.global.entity.BaseEntity;
import com.nayami.server.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "concerns")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Concern extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private User author;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ConcernStatus status;

  public static Concern of(User author, String content) {
    Concern concern = new Concern();
    concern.author = author;
    concern.content = content;
    concern.status = ConcernStatus.PENDING;
    return concern;
  }

  public void updateCheckResult(boolean isSafe) {
    this.status = isSafe ? ConcernStatus.ACTIVE : ConcernStatus.REJECTED;
  }
}
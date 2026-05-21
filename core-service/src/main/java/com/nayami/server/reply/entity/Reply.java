package com.nayami.server.reply.entity;

import com.nayami.server.concern.entity.Concern;
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
@Table(name = "replies")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reply extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "concern_id", nullable = false)
  private Concern concern;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private User author;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ReplyStatus status;

  @Column(columnDefinition = "TEXT")
  private String reason;

  public static Reply of(Concern concern, User author, String content) {
    Reply reply = new Reply();
    reply.concern = concern;
    reply.author = author;
    reply.content = content;
    reply.status = ReplyStatus.PENDING;
    return reply;
  }

  public void updateCheckResult(boolean isSafe, String reason) {
    this.status = isSafe ? ReplyStatus.SAFE : ReplyStatus.UNSAFE;
    this.reason = reason;
  }
}
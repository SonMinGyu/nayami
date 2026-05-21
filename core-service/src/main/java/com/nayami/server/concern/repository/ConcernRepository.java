package com.nayami.server.concern.repository;

import com.nayami.server.concern.entity.Concern;
import com.nayami.server.concern.entity.ConcernStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConcernRepository extends JpaRepository<Concern, Long> {

  List<Concern> findAllByStatus(ConcernStatus status);
}
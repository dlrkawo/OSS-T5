package com.focusorbit.server.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focusorbit.server.models.Session;

public interface SessionRepository extends JpaRepository<Session, Long> {
	List<Session> findByUserIdOrderByStartedAtDesc(String userId);

	List<Session> findTop5ByUserIdAndTaskTypeOrderByStartedAtDesc(
		String userId,
		String taskType
	);
}

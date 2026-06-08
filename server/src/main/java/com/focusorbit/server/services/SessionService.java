package com.focusorbit.server.services;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.focusorbit.server.db.DemoUser;
import com.focusorbit.server.dto.SessionCreateRequest;
import com.focusorbit.server.dto.SessionResponse;
import com.focusorbit.server.models.Session;
import com.focusorbit.server.models.SessionOutcome;
import com.focusorbit.server.repositories.SessionRepository;

@Service
public class SessionService {

	private final SessionRepository sessionRepository;

	public SessionService(SessionRepository sessionRepository) {
		this.sessionRepository = sessionRepository;
	}

	public SessionResponse create(SessionCreateRequest request) {
		String taskType = ApiValueParser.normalizeTaskType(request.taskType());
		SessionOutcome outcome = ApiValueParser.parseOutcome(request.outcome());
		Session session = new Session(
			normalizeUserId(request.userId()),
			request.taskName().trim(),
			taskType,
			request.plannedFocusMinutes(),
			request.plannedBreakMinutes(),
			outcome,
			request.startedAt() == null ? Instant.now() : request.startedAt()
		);
		session.setCycleId(blankToNull(request.cycleId()));
		session.setCycleIndex(request.cycleIndex());
		session.setTotalCycles(request.totalCycles());
		session.setLongBreak(Boolean.TRUE.equals(request.longBreak()));
		session.setPauseCount(request.pauseCount() == null ? 0 : request.pauseCount());
		session.setEndedAt(request.endedAt());

		return toResponse(sessionRepository.save(session));
	}

	public List<SessionResponse> findAll(String userId) {
		return sessionRepository.findByUserIdOrderByStartedAtDesc(normalizeUserId(userId))
			.stream()
			.map(SessionService::toResponse)
			.toList();
	}

	static String normalizeUserId(String userId) {
		return userId == null || userId.isBlank() ? DemoUser.ID : userId.trim();
	}

	static SessionResponse toResponse(Session session) {
		return new SessionResponse(
			session.getId(),
			session.getUserId(),
			session.getTaskName(),
			session.getTaskType(),
			session.getPlannedFocusMinutes(),
			session.getPlannedBreakMinutes(),
			session.getCycleId(),
			session.getCycleIndex(),
			session.getTotalCycles(),
			session.isLongBreak(),
			ApiValueParser.toApiValue(session.getOutcome()),
			session.getPauseCount(),
			session.getStartedAt(),
			session.getEndedAt(),
			session.getCreatedAt()
		);
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}

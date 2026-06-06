package com.focusorbit.server.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.focusorbit.server.dto.StatsResponse;
import com.focusorbit.server.models.Session;
import com.focusorbit.server.models.SessionOutcome;
import com.focusorbit.server.repositories.SessionRepository;

@Service
public class StatsService {

	private final SessionRepository sessionRepository;

	public StatsService(SessionRepository sessionRepository) {
		this.sessionRepository = sessionRepository;
	}

	public StatsResponse getStats(String userId) {
		String normalizedUserId = SessionService.normalizeUserId(userId);
		List<Session> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(normalizedUserId);
		long completedSessions = sessions.stream()
			.filter(session -> session.getOutcome() == SessionOutcome.COMPLETED)
			.count();
		long totalSessions = sessions.size();
		int totalPauseCount = sessions.stream()
			.mapToInt(Session::getPauseCount)
			.sum();
		int totalFocusMinutes = sessions.stream()
			.filter(session -> session.getOutcome() == SessionOutcome.COMPLETED)
			.mapToInt(Session::getPlannedFocusMinutes)
			.sum();
		double completionRate = totalSessions == 0 ? 0 : (double) completedSessions / totalSessions;
		double averagePauseCount = totalSessions == 0 ? 0 : (double) totalPauseCount / totalSessions;

		return new StatsResponse(
			normalizedUserId,
			totalSessions,
			completedSessions,
			totalSessions - completedSessions,
			totalFocusMinutes,
			totalPauseCount,
			round(completionRate),
			round(averagePauseCount),
			calculateFocusScore(totalSessions, completionRate, averagePauseCount)
		);
	}

	private static int calculateFocusScore(long totalSessions, double completionRate, double averagePauseCount) {
		if (totalSessions == 0) {
			return 75;
		}
		double score = 50 + (completionRate * 50) - Math.min(30, averagePauseCount * 8);
		return Math.max(0, Math.min(100, (int) Math.round(score)));
	}

	private static double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}
}

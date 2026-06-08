package com.focusorbit.server.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.focusorbit.server.db.DemoUser;
import com.focusorbit.server.dto.RecommendationResponse;
import com.focusorbit.server.models.Session;
import com.focusorbit.server.models.SessionOutcome;
import com.focusorbit.server.repositories.SessionRepository;

@Service
public class RecommendationService {

	private static final Map<String, TimerPreset> BASE_PRESETS = Map.of(
		"coding", new TimerPreset(40, 10),
		"memorization", new TimerPreset(25, 5),
		"writing", new TimerPreset(45, 10),
		"exam", new TimerPreset(30, 5)
	);
	private static final TimerPreset CUSTOM_DEFAULT_PRESET = new TimerPreset(25, 5);

	private final SessionRepository sessionRepository;

	public RecommendationService(SessionRepository sessionRepository) {
		this.sessionRepository = sessionRepository;
	}

	public RecommendationResponse recommend(String userId, String taskTypeValue) {
		String normalizedUserId = normalizeUserId(userId);
		String taskType = ApiValueParser.normalizeTaskType(taskTypeValue);
		List<Session> recentSessions = sessionRepository.findTop5ByUserIdAndTaskTypeOrderByStartedAtDesc(
			normalizedUserId,
			taskType
		);
		TimerPreset basePreset = basePresetFor(taskType, recentSessions);

		long completedCount = recentSessions.stream()
			.filter(session -> session.getOutcome() == SessionOutcome.COMPLETED)
			.count();
		int totalPauseCount = recentSessions.stream()
			.mapToInt(Session::getPauseCount)
			.sum();
		double completionRate = recentSessions.isEmpty()
			? 0
			: (double) completedCount / recentSessions.size();
		double averagePauseCount = recentSessions.isEmpty()
			? 0
			: (double) totalPauseCount / recentSessions.size();

		int focusMinutes = basePreset.focusMinutes();
		int breakMinutes = basePreset.breakMinutes();
		List<String> reasons = new ArrayList<>();
		reasons.add(BASE_PRESETS.containsKey(taskType)
			? "Base preset for " + taskType
			: "Custom mission preset");

		if (recentSessions.isEmpty()) {
			reasons.add("No mission log yet, so the default rhythm is used");
		} else if (completionRate < 0.6) {
			focusMinutes = Math.max(15, focusMinutes - 5);
			breakMinutes = Math.min(15, breakMinutes + 5);
			reasons.add("Recent completion rate is low, so focus is shortened");
		} else if (averagePauseCount >= 3) {
			focusMinutes = Math.max(15, focusMinutes - 5);
			breakMinutes = Math.min(15, breakMinutes + 5);
			reasons.add("Recent pause count is high, so break time is increased");
		} else if (completionRate >= 0.8 && averagePauseCount <= 1 && recentSessions.size() >= 3) {
			focusMinutes = Math.min(60, focusMinutes + 5);
			reasons.add("Recent sessions are stable, so focus is extended slightly");
		} else {
			reasons.add("Recent pattern is balanced, so the base rhythm is kept");
		}

		return new RecommendationResponse(
			normalizedUserId,
			taskType,
			focusMinutes,
			breakMinutes,
			calculateFocusScore(recentSessions.size(), completionRate, averagePauseCount),
			recentSessions.size(),
			round(completionRate),
			round(averagePauseCount),
			reasons
		);
	}

	private static TimerPreset basePresetFor(String taskType, List<Session> recentSessions) {
		TimerPreset preset = BASE_PRESETS.get(taskType);
		if (preset != null) {
			return preset;
		}

		List<Session> completedSessions = recentSessions.stream()
			.filter(session -> session.getOutcome() == SessionOutcome.COMPLETED)
			.toList();
		if (completedSessions.isEmpty()) {
			return CUSTOM_DEFAULT_PRESET;
		}

		int focusMinutes = (int) Math.round(completedSessions.stream()
			.mapToInt(Session::getPlannedFocusMinutes)
			.average()
			.orElse(CUSTOM_DEFAULT_PRESET.focusMinutes()));
		int breakMinutes = (int) Math.round(completedSessions.stream()
			.mapToInt(Session::getPlannedBreakMinutes)
			.average()
			.orElse(CUSTOM_DEFAULT_PRESET.breakMinutes()));
		return new TimerPreset(focusMinutes, breakMinutes);
	}

	private static int calculateFocusScore(int sessionCount, double completionRate, double averagePauseCount) {
		if (sessionCount == 0) {
			return 75;
		}
		double pausePenalty = Math.min(30, averagePauseCount * 8);
		double score = 50 + (completionRate * 50) - pausePenalty;
		return Math.max(0, Math.min(100, (int) Math.round(score)));
	}

	private static String normalizeUserId(String userId) {
		return userId == null || userId.isBlank() ? DemoUser.ID : userId.trim();
	}

	private static double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}

	private record TimerPreset(int focusMinutes, int breakMinutes) {
	}
}

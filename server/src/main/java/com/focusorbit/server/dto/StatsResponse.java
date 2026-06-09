package com.focusorbit.server.dto;

public record StatsResponse(
	String userId,
	long totalSessions,
	long completedSessions,
	long abortedSessions,
	int totalFocusMinutes,
	int totalPauseCount,
	double completionRate,
	double averagePauseCount,
	int focusScore
) {
}

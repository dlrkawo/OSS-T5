package com.focusorbit.server.dto;

import java.time.Instant;

public record SessionResponse(
	Long id,
	String userId,
	String taskName,
	String taskType,
	int plannedFocusMinutes,
	int plannedBreakMinutes,
	String cycleId,
	Integer cycleIndex,
	Integer totalCycles,
	boolean longBreak,
	String outcome,
	int pauseCount,
	Instant startedAt,
	Instant endedAt,
	Instant createdAt
) {
}

package com.focusorbit.server.dto;

import java.time.Instant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SessionCreateRequest(
	String userId,
	@NotBlank String taskName,
	@NotBlank String taskType,
	@NotNull @Min(1) Integer plannedFocusMinutes,
	@NotNull @Min(1) Integer plannedBreakMinutes,
	String cycleId,
	Integer cycleIndex,
	Integer totalCycles,
	Boolean longBreak,
	String outcome,
	@Min(0) Integer pauseCount,
	Instant startedAt,
	Instant endedAt
) {
}

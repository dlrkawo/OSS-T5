package com.focusorbit.server.dto;

import java.util.List;

public record RecommendationResponse(
	String userId,
	String taskType,
	int focusMinutes,
	int breakMinutes,
	int focusScore,
	int recentSessionCount,
	double completionRate,
	double averagePauseCount,
	List<String> reasons
) {
}

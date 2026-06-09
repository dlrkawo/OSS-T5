package com.focusorbit.server.dto;

import java.time.Instant;

public record SettingResponse(
	String userId,
	boolean demoShortTimer,
	boolean minimalMode,
	boolean reduceVisualEffects,
	boolean soundAlert,
	boolean desktopNotification,
	boolean showTimerInTitle,
	Instant createdAt,
	Instant updatedAt
) {
}

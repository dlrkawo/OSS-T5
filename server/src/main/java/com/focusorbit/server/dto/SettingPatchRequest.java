package com.focusorbit.server.dto;

public record SettingPatchRequest(
	Boolean demoShortTimer,
	Boolean minimalMode,
	Boolean reduceVisualEffects,
	Boolean soundAlert,
	Boolean desktopNotification,
	Boolean showTimerInTitle
) {
}

package com.focusorbit.server.services;

import java.util.Arrays;
import java.util.Locale;

import com.focusorbit.server.models.SessionOutcome;
import com.focusorbit.server.models.TaskType;

final class ApiValueParser {

	private ApiValueParser() {
	}

	static TaskType parseTaskType(String value) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("taskType is required");
		}
		try {
			return TaskType.valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("taskType must be one of " + Arrays.toString(TaskType.values()));
		}
	}

	static SessionOutcome parseOutcome(String value) {
		if (value == null || value.isBlank()) {
			return SessionOutcome.COMPLETED;
		}
		try {
			return SessionOutcome.valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("outcome must be one of " + Arrays.toString(SessionOutcome.values()));
		}
	}

	static String toApiValue(Enum<?> value) {
		return value.name().toLowerCase(Locale.ROOT).replace('_', '-');
	}
}

package com.focusorbit.server.services;

import org.springframework.stereotype.Service;

import com.focusorbit.server.dto.SettingPatchRequest;
import com.focusorbit.server.dto.SettingResponse;
import com.focusorbit.server.models.Setting;
import com.focusorbit.server.repositories.SettingRepository;

@Service
public class SettingService {

	private final SettingRepository settingRepository;

	public SettingService(SettingRepository settingRepository) {
		this.settingRepository = settingRepository;
	}

	public SettingResponse get(String userId) {
		return toResponse(getOrCreate(userId));
	}

	public SettingResponse update(String userId, SettingPatchRequest request) {
		Setting setting = getOrCreate(userId);
		if (request.demoShortTimer() != null) {
			setting.setDemoShortTimer(request.demoShortTimer());
		}
		if (request.minimalMode() != null) {
			setting.setMinimalMode(request.minimalMode());
		}
		if (request.reduceVisualEffects() != null) {
			setting.setReduceVisualEffects(request.reduceVisualEffects());
		}
		if (request.soundAlert() != null) {
			setting.setSoundAlert(request.soundAlert());
		}
		if (request.desktopNotification() != null) {
			setting.setDesktopNotification(request.desktopNotification());
		}
		if (request.showTimerInTitle() != null) {
			setting.setShowTimerInTitle(request.showTimerInTitle());
		}
		return toResponse(settingRepository.save(setting));
	}

	private Setting getOrCreate(String userId) {
		String normalizedUserId = SessionService.normalizeUserId(userId);
		return settingRepository.findByUserId(normalizedUserId)
			.orElseGet(() -> settingRepository.save(new Setting(normalizedUserId)));
	}

	private static SettingResponse toResponse(Setting setting) {
		return new SettingResponse(
			setting.getUserId(),
			setting.isDemoShortTimer(),
			setting.isMinimalMode(),
			setting.isReduceVisualEffects(),
			setting.isSoundAlert(),
			setting.isDesktopNotification(),
			setting.isShowTimerInTitle(),
			setting.getCreatedAt(),
			setting.getUpdatedAt()
		);
	}
}

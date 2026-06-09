package com.focusorbit.server.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.focusorbit.server.dto.SettingPatchRequest;
import com.focusorbit.server.dto.SettingResponse;
import com.focusorbit.server.services.SettingService;

@RestController
@RequestMapping("/api/settings")
public class SettingController {

	private final SettingService settingService;

	public SettingController(SettingService settingService) {
		this.settingService = settingService;
	}

	@GetMapping
	public SettingResponse get(@RequestParam(required = false) String userId) {
		return settingService.get(userId);
	}

	@PatchMapping
	public SettingResponse update(
		@RequestParam(required = false) String userId,
		@RequestBody SettingPatchRequest request
	) {
		return settingService.update(userId, request);
	}
}

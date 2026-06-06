package com.focusorbit.server.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.focusorbit.server.dto.StatsResponse;
import com.focusorbit.server.services.StatsService;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

	private final StatsService statsService;

	public StatsController(StatsService statsService) {
		this.statsService = statsService;
	}

	@GetMapping
	public StatsResponse getStats(@RequestParam(required = false) String userId) {
		return statsService.getStats(userId);
	}
}

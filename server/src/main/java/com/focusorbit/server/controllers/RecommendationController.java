package com.focusorbit.server.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.focusorbit.server.dto.RecommendationResponse;
import com.focusorbit.server.services.RecommendationService;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

	private final RecommendationService recommendationService;

	public RecommendationController(RecommendationService recommendationService) {
		this.recommendationService = recommendationService;
	}

	@GetMapping
	public RecommendationResponse recommend(
		@RequestParam(defaultValue = "coding") String taskType,
		@RequestParam(required = false) String userId
	) {
		return recommendationService.recommend(userId, taskType);
	}
}

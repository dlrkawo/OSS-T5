package com.focusorbit.server.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.focusorbit.server.dto.SessionCreateRequest;
import com.focusorbit.server.dto.SessionResponse;
import com.focusorbit.server.services.SessionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

	private final SessionService sessionService;

	public SessionController(SessionService sessionService) {
		this.sessionService = sessionService;
	}

	@PostMapping
	public SessionResponse create(@Valid @RequestBody SessionCreateRequest request) {
		return sessionService.create(request);
	}

	@GetMapping
	public List<SessionResponse> findAll(@RequestParam(required = false) String userId) {
		return sessionService.findAll(userId);
	}
}

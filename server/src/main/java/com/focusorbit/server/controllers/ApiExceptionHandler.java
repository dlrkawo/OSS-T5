package com.focusorbit.server.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.focusorbit.server.dto.ApiErrorResponse;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
		Map<String, String> details = new HashMap<>();
		for (FieldError error : exception.getBindingResult().getFieldErrors()) {
			details.put(error.getField(), error.getDefaultMessage());
		}
		return ResponseEntity.badRequest().body(new ApiErrorResponse("Invalid request", details));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(new ApiErrorResponse(exception.getMessage(), Map.of()));
	}
}

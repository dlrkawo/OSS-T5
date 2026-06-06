package com.focusorbit.server.controllers;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.focusorbit.server.repositories.SessionRepository;
import com.focusorbit.server.repositories.SettingRepository;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
class ApiControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private SessionRepository sessionRepository;

	@Autowired
	private SettingRepository settingRepository;

	@BeforeEach
	void setUp() {
		sessionRepository.deleteAll();
		settingRepository.deleteAll();
	}

	@Test
	void createsAndListsSessions() throws Exception {
		mockMvc.perform(post("/api/sessions")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "taskName": "Implement API",
					  "taskType": "coding",
					  "plannedFocusMinutes": 40,
					  "plannedBreakMinutes": 10,
					  "cycleId": "cycle-1",
					  "cycleIndex": 1,
					  "totalCycles": 4,
					  "outcome": "completed",
					  "pauseCount": 1
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.userId").value("demo-user"))
			.andExpect(jsonPath("$.taskType").value("coding"))
			.andExpect(jsonPath("$.outcome").value("completed"));

		mockMvc.perform(get("/api/sessions"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(1)))
			.andExpect(jsonPath("$[0].taskName").value("Implement API"));
	}

	@Test
	void returnsRecommendationAndStats() throws Exception {
		createSession("completed", 0);
		createSession("completed", 1);
		createSession("aborted", 4);

		mockMvc.perform(get("/api/recommendations").param("taskType", "coding"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.taskType").value("coding"))
			.andExpect(jsonPath("$.focusMinutes").isNumber())
			.andExpect(jsonPath("$.breakMinutes").isNumber())
			.andExpect(jsonPath("$.focusScore").isNumber());

		mockMvc.perform(get("/api/stats"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalSessions").value(3))
			.andExpect(jsonPath("$.completedSessions").value(2))
			.andExpect(jsonPath("$.abortedSessions").value(1))
			.andExpect(jsonPath("$.totalFocusMinutes").value(80));
	}

	@Test
	void getsAndPatchesSettings() throws Exception {
		mockMvc.perform(get("/api/settings"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.userId").value("demo-user"))
			.andExpect(jsonPath("$.minimalMode").value(false));

		mockMvc.perform(patch("/api/settings")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "minimalMode": true,
					  "soundAlert": true,
					  "showTimerInTitle": true
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.minimalMode").value(true))
			.andExpect(jsonPath("$.soundAlert").value(true))
			.andExpect(jsonPath("$.showTimerInTitle").value(true));
	}

	@Test
	void returnsValidationErrors() throws Exception {
		mockMvc.perform(post("/api/sessions")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "taskName": "",
					  "taskType": "coding",
					  "plannedFocusMinutes": 0,
					  "plannedBreakMinutes": 10
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("Invalid request"));
	}

	private void createSession(String outcome, int pauseCount) throws Exception {
		mockMvc.perform(post("/api/sessions")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "taskName": "Coding mission",
					  "taskType": "coding",
					  "plannedFocusMinutes": 40,
					  "plannedBreakMinutes": 10,
					  "outcome": "%s",
					  "pauseCount": %d
					}
					""".formatted(outcome, pauseCount)))
			.andExpect(status().isOk());
	}
}

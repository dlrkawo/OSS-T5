package com.focusorbit.server.repositories;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.focusorbit.server.db.DemoUser;
import com.focusorbit.server.models.Session;
import com.focusorbit.server.models.SessionOutcome;
import com.focusorbit.server.models.Setting;
import com.focusorbit.server.models.TaskType;

@ActiveProfiles("test")
@DataJpaTest
class RepositoryTests {

	@Autowired
	private SessionRepository sessionRepository;

	@Autowired
	private SettingRepository settingRepository;

	@Test
	void findsSessionsByUserNewestFirst() {
		Instant now = Instant.now();
		Session older = new Session(
			DemoUser.ID,
			"Older mission",
			TaskType.CODING,
			40,
			10,
			SessionOutcome.COMPLETED,
			now.minusSeconds(60)
		);
		Session newer = new Session(
			DemoUser.ID,
			"Newer mission",
			TaskType.WRITING,
			30,
			7,
			SessionOutcome.ABORTED,
			now
		);

		sessionRepository.save(older);
		sessionRepository.save(newer);

		assertThat(sessionRepository.findByUserIdOrderByStartedAtDesc(DemoUser.ID))
			.extracting(Session::getTaskName)
			.containsExactly("Newer mission", "Older mission");
	}

	@Test
	void findsRecentSessionsByUserAndTaskType() {
		Instant now = Instant.now();
		for (int i = 0; i < 6; i++) {
			sessionRepository.save(new Session(
				DemoUser.ID,
				"Coding " + i,
				TaskType.CODING,
				40,
				10,
				SessionOutcome.COMPLETED,
				now.minusSeconds(i)
			));
		}
		sessionRepository.save(new Session(
			DemoUser.ID,
			"Writing",
			TaskType.WRITING,
			30,
			7,
			SessionOutcome.COMPLETED,
			now.plusSeconds(1)
		));

		assertThat(sessionRepository.findTop5ByUserIdAndTaskTypeOrderByStartedAtDesc(
			DemoUser.ID,
			TaskType.CODING
		)).hasSize(5)
			.allMatch(session -> session.getTaskType() == TaskType.CODING);
	}

	@Test
	void findsSettingByUserId() {
		Setting setting = new Setting(DemoUser.ID);
		setting.setDemoShortTimer(true);
		setting.setShowTimerInTitle(true);

		settingRepository.save(setting);

		assertThat(settingRepository.findByUserId(DemoUser.ID))
			.isPresent()
			.get()
			.matches(Setting::isDemoShortTimer)
			.matches(Setting::isShowTimerInTitle);
	}
}

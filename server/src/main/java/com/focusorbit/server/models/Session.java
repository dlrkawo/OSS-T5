package com.focusorbit.server.models;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(
	name = "sessions",
	indexes = {
		@Index(name = "idx_sessions_user_started", columnList = "userId, startedAt"),
		@Index(name = "idx_sessions_user_task_started", columnList = "userId, taskType, startedAt")
	}
)
public class Session {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String userId;

	@Column(nullable = false)
	private String taskName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TaskType taskType;

	@Column(nullable = false)
	private int plannedFocusMinutes;

	@Column(nullable = false)
	private int plannedBreakMinutes;

	private String cycleId;

	private Integer cycleIndex;

	private Integer totalCycles;

	@Column(nullable = false)
	private boolean longBreak;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SessionOutcome outcome;

	@Column(nullable = false)
	private int pauseCount;

	@Column(nullable = false)
	private Instant startedAt;

	private Instant endedAt;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	protected Session() {
	}

	public Session(
		String userId,
		String taskName,
		TaskType taskType,
		int plannedFocusMinutes,
		int plannedBreakMinutes,
		SessionOutcome outcome,
		Instant startedAt
	) {
		this.userId = userId;
		this.taskName = taskName;
		this.taskType = taskType;
		this.plannedFocusMinutes = plannedFocusMinutes;
		this.plannedBreakMinutes = plannedBreakMinutes;
		this.outcome = outcome;
		this.startedAt = startedAt;
	}

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}

	public Long getId() {
		return id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getTaskName() {
		return taskName;
	}

	public void setTaskName(String taskName) {
		this.taskName = taskName;
	}

	public TaskType getTaskType() {
		return taskType;
	}

	public void setTaskType(TaskType taskType) {
		this.taskType = taskType;
	}

	public int getPlannedFocusMinutes() {
		return plannedFocusMinutes;
	}

	public void setPlannedFocusMinutes(int plannedFocusMinutes) {
		this.plannedFocusMinutes = plannedFocusMinutes;
	}

	public int getPlannedBreakMinutes() {
		return plannedBreakMinutes;
	}

	public void setPlannedBreakMinutes(int plannedBreakMinutes) {
		this.plannedBreakMinutes = plannedBreakMinutes;
	}

	public String getCycleId() {
		return cycleId;
	}

	public void setCycleId(String cycleId) {
		this.cycleId = cycleId;
	}

	public Integer getCycleIndex() {
		return cycleIndex;
	}

	public void setCycleIndex(Integer cycleIndex) {
		this.cycleIndex = cycleIndex;
	}

	public Integer getTotalCycles() {
		return totalCycles;
	}

	public void setTotalCycles(Integer totalCycles) {
		this.totalCycles = totalCycles;
	}

	public boolean isLongBreak() {
		return longBreak;
	}

	public void setLongBreak(boolean longBreak) {
		this.longBreak = longBreak;
	}

	public SessionOutcome getOutcome() {
		return outcome;
	}

	public void setOutcome(SessionOutcome outcome) {
		this.outcome = outcome;
	}

	public int getPauseCount() {
		return pauseCount;
	}

	public void setPauseCount(int pauseCount) {
		this.pauseCount = pauseCount;
	}

	public Instant getStartedAt() {
		return startedAt;
	}

	public void setStartedAt(Instant startedAt) {
		this.startedAt = startedAt;
	}

	public Instant getEndedAt() {
		return endedAt;
	}

	public void setEndedAt(Instant endedAt) {
		this.endedAt = endedAt;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}

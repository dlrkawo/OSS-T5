package com.focusorbit.server.models;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "settings",
	uniqueConstraints = @UniqueConstraint(name = "uk_settings_user_id", columnNames = "userId")
)
public class Setting {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String userId;

	@Column(nullable = false)
	private boolean demoShortTimer;

	@Column(nullable = false)
	private boolean minimalMode;

	@Column(nullable = false)
	private boolean reduceVisualEffects;

	@Column(nullable = false)
	private boolean soundAlert;

	@Column(nullable = false)
	private boolean desktopNotification;

	@Column(nullable = false)
	private boolean showTimerInTitle;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	protected Setting() {
	}

	public Setting(String userId) {
		this.userId = userId;
		this.showTimerInTitle = true;
	}

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		if (createdAt == null) {
			createdAt = now;
		}
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
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

	public boolean isDemoShortTimer() {
		return demoShortTimer;
	}

	public void setDemoShortTimer(boolean demoShortTimer) {
		this.demoShortTimer = demoShortTimer;
	}

	public boolean isMinimalMode() {
		return minimalMode;
	}

	public void setMinimalMode(boolean minimalMode) {
		this.minimalMode = minimalMode;
	}

	public boolean isReduceVisualEffects() {
		return reduceVisualEffects;
	}

	public void setReduceVisualEffects(boolean reduceVisualEffects) {
		this.reduceVisualEffects = reduceVisualEffects;
	}

	public boolean isSoundAlert() {
		return soundAlert;
	}

	public void setSoundAlert(boolean soundAlert) {
		this.soundAlert = soundAlert;
	}

	public boolean isDesktopNotification() {
		return desktopNotification;
	}

	public void setDesktopNotification(boolean desktopNotification) {
		this.desktopNotification = desktopNotification;
	}

	public boolean isShowTimerInTitle() {
		return showTimerInTitle;
	}

	public void setShowTimerInTitle(boolean showTimerInTitle) {
		this.showTimerInTitle = showTimerInTitle;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}

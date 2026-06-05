package com.focusorbit.server.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focusorbit.server.models.Setting;

public interface SettingRepository extends JpaRepository<Setting, Long> {
	Optional<Setting> findByUserId(String userId);
}

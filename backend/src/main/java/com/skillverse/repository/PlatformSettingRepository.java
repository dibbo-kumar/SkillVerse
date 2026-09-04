package com.skillverse.repository;

import com.skillverse.model.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, Long> {
    Optional<PlatformSetting> findBySettingKey(String settingKey);
}

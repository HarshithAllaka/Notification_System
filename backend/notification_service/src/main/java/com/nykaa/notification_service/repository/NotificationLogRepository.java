package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    // This finds all logs for a specific campaign so we can build the report
    List<NotificationLog> findByCampaignId(Long campaignId);
}
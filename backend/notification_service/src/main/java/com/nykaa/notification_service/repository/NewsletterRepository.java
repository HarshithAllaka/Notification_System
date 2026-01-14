package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.Newsletter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterRepository extends JpaRepository<Newsletter, Long> {
}
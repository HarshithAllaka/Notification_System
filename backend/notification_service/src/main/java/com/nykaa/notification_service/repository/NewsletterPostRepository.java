package com.nykaa.notification_service.repository;

import com.nykaa.notification_service.entity.NewsletterPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NewsletterPostRepository extends JpaRepository<NewsletterPost, Long> {
    List<NewsletterPost> findByNewsletterId(Long newsletterId);
}
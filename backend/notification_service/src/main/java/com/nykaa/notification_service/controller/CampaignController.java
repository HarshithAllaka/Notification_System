package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.entity.Campaign;
import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.service.CampaignService;
import com.nykaa.notification_service.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;
    private final CampaignRepository campaignRepository;

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CREATOR')")
    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
        return ResponseEntity.ok(campaignRepository.save(campaign));
    }

    @GetMapping("/{id}/preview")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CREATOR', 'VIEWER')")
    public ResponseEntity<List<User>> previewTargets(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.resolveTargets(id));
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CREATOR')")
    public ResponseEntity<String> sendCampaign(@PathVariable Long id) {
        campaignService.sendMockNotifications(id);
        return ResponseEntity.ok("Campaign notifications sent and logged.");
    }
}
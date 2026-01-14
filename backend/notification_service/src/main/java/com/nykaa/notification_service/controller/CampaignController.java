package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.dto.CampaignRequest;
import com.nykaa.notification_service.dto.RecipientDto;
import com.nykaa.notification_service.entity.Campaign;
import com.nykaa.notification_service.service.CampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping("/create")
    public ResponseEntity<String> createCampaign(@RequestBody CampaignRequest request) {
        // Check if scheduling is requested
        if (request.getScheduledAt() != null) {
            campaignService.scheduleCampaign(request);
            return ResponseEntity.ok("Campaign scheduled successfully!");
        } else {
            campaignService.executeCampaign(request);
            return ResponseEntity.ok("Campaign launched immediately!");
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Campaign>> getHistory() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}/recipients")
    public ResponseEntity<List<RecipientDto>> getRecipients(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignRecipients(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok("Campaign deleted");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(@PathVariable Long id, @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request));
    }
}